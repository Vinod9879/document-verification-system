using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webApitest.Data;
using webApitest.Models;
using webApitest.Models.DTOs;
using webApitest.Services;
using System.Security.Claims;
using System.Text.Json;

namespace webApitest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserDashboardController> _logger;
        private readonly IDocumentExtractionService _documentExtractionService;

        public UserDashboardController(ApplicationDbContext context, ILogger<UserDashboardController> logger, IDocumentExtractionService documentExtractionService)
        {
            _context = context;
            _logger = logger;
            _documentExtractionService = documentExtractionService;
        }

        // Get current user ID from JWT token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            throw new UnauthorizedAccessException("Invalid user token");
        }

        // 1. Profile Overview - Get user profile
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                    return NotFound("User not found");

                var profile = new UserProfileDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.Phone,
                    City = user.City,
                    State = user.State,
                    Pincode = user.Pincode,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, "Internal server error");
            }
        }

        // 2. Update Profile - Users can update personal details before document submission
        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile([FromBody] UpdateUserProfileDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                    return NotFound("User not found");

                // Check if documents are already submitted
                var hasSubmittedDocuments = await _context.UserUploadedDocuments
                    .AnyAsync(ud => ud.UserId == userId && ud.IsSubmitted);

                if (hasSubmittedDocuments)
                    return BadRequest("Cannot update profile after document submission");

                // Update user details
                user.FullName = updateDto.FullName;
                user.Phone = updateDto.Phone;
                user.City = updateDto.City;
                user.State = updateDto.State;
                user.Pincode = updateDto.Pincode;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log activity
                await LogUserActivity(userId, "Profile Updated", "User updated their profile information");

                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, "Internal server error");
            }
        }

        // 3. Document Upload - One-time submission
        [HttpPost("upload-documents")]
        public async Task<ActionResult> UploadDocuments([FromForm] DocumentUploadDto uploadDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Check if documents already submitted
                var existingUpload = await _context.UserUploadedDocuments
                    .FirstOrDefaultAsync(ud => ud.UserId == userId);

                // Allow second round submissions - just warn the user
                if (existingUpload != null && existingUpload.IsSubmitted)
                {
                    // Log that user is submitting second round
                    await LogUserActivity(userId, "Second Round Upload", "User submitted second round of documents");
                }

                // Validate files
                if (uploadDto.EC == null || uploadDto.Aadhaar == null || uploadDto.PAN == null)
                    return BadRequest("All three documents (EC, Aadhaar, PAN) are required");

                // Validate file types
                var allowedExtensions = new[] { ".pdf" };
                var files = new[] { uploadDto.EC, uploadDto.Aadhaar, uploadDto.PAN };
                
                foreach (var file in files)
                {
                    var extension = Path.GetExtension(file.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                        return BadRequest($"Invalid file type for {file.FileName}. Only PDF files are allowed.");
                }

                // Create uploads directory if not exists
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "UserDocuments", userId.ToString());
                Directory.CreateDirectory(uploadsPath);

                // Save files
                var ecPath = Path.Combine(uploadsPath, $"EC_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf");
                var aadhaarPath = Path.Combine(uploadsPath, $"Aadhaar_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf");
                var panPath = Path.Combine(uploadsPath, $"PAN_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf");

                using (var stream = new FileStream(ecPath, FileMode.Create))
                    await uploadDto.EC.CopyToAsync(stream);

                using (var stream = new FileStream(aadhaarPath, FileMode.Create))
                    await uploadDto.Aadhaar.CopyToAsync(stream);

                using (var stream = new FileStream(panPath, FileMode.Create))
                    await uploadDto.PAN.CopyToAsync(stream);

                // Create or update UserUploadedDocuments record
                if (existingUpload == null)
                {
                    existingUpload = new UserUploadedDocuments
                    {
                        UserId = userId,
                        ECPath = ecPath,
                        AadhaarPath = aadhaarPath,
                        PANPath = panPath,
                        IsSubmitted = true,
                        SubmittedAt = DateTime.UtcNow
                    };
                    _context.UserUploadedDocuments.Add(existingUpload);
                }
                else
                {
                    // Second round submission - reset verification status
                    existingUpload.ECPath = ecPath;
                    existingUpload.AadhaarPath = aadhaarPath;
                    existingUpload.PANPath = panPath;
                    existingUpload.IsSubmitted = true;
                    existingUpload.SubmittedAt = DateTime.UtcNow;
                    
                    // Reset verification data for new submission
                    existingUpload.IsVerified = false;
                    existingUpload.RiskScore = 0;
                    existingUpload.VerificationNotes = null;
                    existingUpload.ExtractedData = null;
                    existingUpload.FieldMismatches = null;
                    existingUpload.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                // Call DLL extraction functions
                await CallDLLExtraction(existingUpload.Id);

                // Log activity
                var isSecondRound = existingUpload != null && existingUpload.UpdatedAt.HasValue;
                var activityMessage = isSecondRound ? 
                    "User submitted second round of documents (EC, Aadhaar, PAN)" : 
                    "User uploaded EC, Aadhaar, and PAN documents";
                
                await LogUserActivity(userId, "Document Upload", activityMessage);

                var responseMessage = isSecondRound ? 
                    "Second round documents submitted successfully. New verification will be processed." :
                    "Documents submitted successfully. Editing is disabled.";

                return Ok(new { message = responseMessage, isSecondRound = isSecondRound });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading documents");
                return StatusCode(500, "Internal server error");
            }
        }

        // 4. Get Document Status
        [HttpGet("document-status")]
        public async Task<ActionResult<DocumentStatusDto>> GetDocumentStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                var upload = await _context.UserUploadedDocuments
                    .FirstOrDefaultAsync(ud => ud.UserId == userId);

                if (upload == null)
                    return NotFound("No documents uploaded");

                var status = new DocumentStatusDto
                {
                    Id = upload.Id,
                    IsSubmitted = upload.IsSubmitted,
                    IsVerified = upload.IsVerified,
                    RiskScore = upload.RiskScore,
                    VerificationNotes = upload.VerificationNotes,
                    FieldMismatches = upload.FieldMismatches,
                    SubmittedAt = upload.SubmittedAt,
                    CreatedAt = upload.CreatedAt
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document status");
                return StatusCode(500, "Internal server error");
            }
        }

        // 5. Get Extracted Data (if available)
        [HttpGet("extracted-data")]
        public async Task<ActionResult<ExtractedDataDto>> GetExtractedData()
        {
            try
            {
                var userId = GetCurrentUserId();
                var upload = await _context.UserUploadedDocuments
                    .FirstOrDefaultAsync(ud => ud.UserId == userId);

                if (upload == null || string.IsNullOrEmpty(upload.ExtractedData))
                    return NotFound("No extracted data available");

                var extractedData = JsonSerializer.Deserialize<ExtractedDataDto>(upload.ExtractedData);
                return Ok(extractedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting extracted data");
                return StatusCode(500, "Internal server error");
            }
        }

        // 6. Trigger Verification
        [HttpPost("verify-documents")]
        public async Task<ActionResult> VerifyDocuments()
        {
            try
            {
                var userId = GetCurrentUserId();
                var upload = await _context.UserUploadedDocuments
                    .FirstOrDefaultAsync(ud => ud.UserId == userId);

                if (upload == null)
                    return NotFound("No documents uploaded");

                if (!upload.IsSubmitted)
                    return BadRequest("Documents not yet submitted");

                // Call DLL verification function
                await CallDLLVerification(upload.Id);

                // Log activity
                await LogUserActivity(userId, "Document Verification", "User triggered document verification");

                return Ok(new { message = "Verification process initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying documents");
                return StatusCode(500, "Internal server error");
            }
        }

        // 7. Get Upload History
        [HttpGet("upload-history")]
        public async Task<ActionResult> GetUploadHistory()
        {
            try
            {
                var userId = GetCurrentUserId();
                var uploads = await _context.UserUploadedDocuments
                    .Where(ud => ud.UserId == userId)
                    .OrderByDescending(ud => ud.CreatedAt)
                    .Select(ud => new
                    {
                        ud.Id,
                        ud.IsSubmitted,
                        ud.IsVerified,
                        ud.RiskScore,
                        ud.SubmittedAt,
                        ud.CreatedAt
                    })
                    .ToListAsync();

                return Ok(uploads);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upload history");
                return StatusCode(500, "Internal server error");
            }
        }

        // Helper method to call DLL verification
        private async Task CallDLLVerification(int uploadId)
        {
            try
            {
                var result = await _documentExtractionService.VerifyDocumentsAsync(uploadId);
                
                var upload = await _context.UserUploadedDocuments.FindAsync(uploadId);
                if (upload != null)
                {
                    upload.IsVerified = result.IsVerified;
                    upload.RiskScore = result.RiskScore;
                    upload.VerificationNotes = result.VerificationNotes;
                    upload.FieldMismatches = result.FieldMismatches;
                    upload.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation($"Successfully verified documents for upload {uploadId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verifying documents for upload {uploadId}");
            }
        }

        // Helper method to call DLL extraction
        private async Task CallDLLExtraction(int uploadId)
        {
            try
            {
                var upload = await _context.UserUploadedDocuments.FindAsync(uploadId);
                if (upload == null) return;

                var extractedData = new ExtractedDataDto();

                // Extract from EC document
                if (!string.IsNullOrEmpty(upload.ECPath))
                {
                    var ecData = await _documentExtractionService.ExtractECAsync(upload.ECPath);
                    extractedData.Name = ecData.Name;
                    extractedData.DOB = ecData.DOB;
                    extractedData.SurveyNumber = ecData.SurveyNumber;
                    extractedData.Address = ecData.Address;
                }

                // Extract from Aadhaar document
                if (!string.IsNullOrEmpty(upload.AadhaarPath))
                {
                    var aadhaarData = await _documentExtractionService.ExtractAadhaarAsync(upload.AadhaarPath);
                    extractedData.Name = aadhaarData.Name ?? extractedData.Name;
                    extractedData.DOB = aadhaarData.DOB ?? extractedData.DOB;
                    extractedData.AadhaarNumber = aadhaarData.AadhaarNumber;
                    extractedData.FatherName = aadhaarData.FatherName;
                    extractedData.MotherName = aadhaarData.MotherName;
                }

                // Extract from PAN document
                if (!string.IsNullOrEmpty(upload.PANPath))
                {
                    var panData = await _documentExtractionService.ExtractPANAsync(upload.PANPath);
                    extractedData.Name = panData.Name ?? extractedData.Name;
                    extractedData.DOB = panData.DOB ?? extractedData.DOB;
                    extractedData.PANNumber = panData.PANNumber;
                }

                // Save extracted data
                upload.ExtractedData = JsonSerializer.Serialize(extractedData);
                upload.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Successfully extracted data for upload {uploadId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting data for upload {uploadId}");
            }
        }

        // Helper method to log user activity
        private async Task LogUserActivity(int userId, string activity, string description)
        {
            try
            {
                var activityLog = new UserActivityLog
                {
                    UserId = userId,
                    Activity = activity,
                    Description = description,
                    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
                };

                _context.UserActivityLogs.Add(activityLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging user activity");
            }
        }
    }
}
