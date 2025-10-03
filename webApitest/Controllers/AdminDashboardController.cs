
using DocumentVerificationDLL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using VerificationDLL;
using webApitest.Data;
using webApitest.DTOs;
using webApitest.Models;
using webApitest.Services;

namespace webApitest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminDashboardController> _logger;
        private readonly IDocumentVerificationDLL _documentVerificationDLL;
        private readonly IVerificationDLL _verificationDLL;
        private readonly IAuditService _auditService;

        public AdminDashboardController(ApplicationDbContext context, ILogger<AdminDashboardController> logger, IDocumentVerificationDLL documentVerificationDLL, IVerificationDLL verificationDLL, IAuditService auditService)
        {
            _context = context;
            _logger = logger;
            _documentVerificationDLL = documentVerificationDLL;
            _verificationDLL = verificationDLL;
            _auditService = auditService;
        }

        // Get current admin user ID from JWT token
        private int GetCurrentAdminId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            throw new UnauthorizedAccessException("Invalid admin token");
        }

        // Check if current user is admin
        private bool IsAdmin()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value == "Admin";
        }

        // Get all users (Admin only)
        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            if (!IsAdmin())
            {
                return StatusCode(403, "Only administrators can view all users");
            }

            try
            {
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.FullName,
                        u.Email,
                        u.Phone,
                        u.City,
                        u.State,
                        u.Pincode,
                        u.Role,
                        u.CreatedAt
                    })
                    .ToListAsync();

                // Log the activity
                await _auditService.LogActivityAsync(
                    GetCurrentAdminId(),
                    "ViewAllUsers",
                    "Admin viewed all users list",
                    "User",
                    null,
                    "Success",
                    null
                );

                return Ok(new { users });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all users");
                return StatusCode(500, "Internal server error");
            }
        }

        // Get user by ID (Admin only)
        [HttpGet("users/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(int id)
        {
            if (!IsAdmin())
            {
                return StatusCode(403, "Only administrators can view user details");
            }

            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.FullName,
                        u.Email,
                        u.Phone,
                        u.City,
                        u.State,
                        u.Pincode,
                        u.Role,
                        u.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Log the activity
                await _auditService.LogActivityAsync(
                    GetCurrentAdminId(),
                    "ViewUserDetails",
                    $"Admin viewed details for user {user.FullName}",
                    "User",
                    id,
                    "Success",
                    null
                );

                return Ok(new { user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user by ID");
                return StatusCode(500, "Internal server error");
            }
        }

        // Update user (Admin only)
        [HttpPut("users/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            if (!IsAdmin())
            {
                return StatusCode(403, "Only administrators can update users");
            }

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Update user properties
                user.FullName = updateUserDto.FullName;
                user.Email = updateUserDto.Email;
                user.Phone = updateUserDto.Phone;
                user.City = updateUserDto.City;
                user.State = updateUserDto.State;
                user.Pincode = updateUserDto.Pincode;
                user.Role = updateUserDto.Role;

                await _context.SaveChangesAsync();

                // Log the activity
                await _auditService.LogActivityAsync(
                    GetCurrentAdminId(),
                    "UpdateUser",
                    $"Admin updated user {user.FullName}",
                    "User",
                    id,
                    "Success",
                    $"Updated fields: {string.Join(", ", GetUpdatedFields(user, updateUserDto))}"
                );

                return Ok(new { message = "User updated successfully", user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return StatusCode(500, "Internal server error");
            }
        }

        // Delete user (Admin only)
        [HttpDelete("users/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            if (!IsAdmin())
            {
                return StatusCode(403, "Only administrators can delete users");
            }

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var userName = user.FullName;
                var userEmail = user.Email;

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                // Log the activity
                await _auditService.LogActivityAsync(
                    GetCurrentAdminId(),
                    "DeleteUser",
                    $"Admin deleted user {userName} ({userEmail})",
                    "User",
                    id,
                    "Success",
                    null
                );

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                return StatusCode(500, "Internal server error");
            }
        }

        // Helper method to get updated fields for audit logging
        private List<string> GetUpdatedFields(User user, UpdateUserDto updateUserDto)
        {
            var updatedFields = new List<string>();
            
            if (user.FullName != updateUserDto.FullName) updatedFields.Add("FullName");
            if (user.Email != updateUserDto.Email) updatedFields.Add("Email");
            if (user.Phone != updateUserDto.Phone) updatedFields.Add("Phone");
            if (user.City != updateUserDto.City) updatedFields.Add("City");
            if (user.State != updateUserDto.State) updatedFields.Add("State");
            if (user.Pincode != updateUserDto.Pincode) updatedFields.Add("Pincode");
            if (user.Role != updateUserDto.Role) updatedFields.Add("Role");
            
            return updatedFields;
        }

        [HttpPost("extract/{uploadId}")]
        [Authorize]
        public async Task<IActionResult> ExtractDocuments(int uploadId)
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                // 1. Get uploaded document record
                var upload = await _context.UserUploadedDocuments
                    .Include(u => u.User)
                    .FirstOrDefaultAsync(u => u.Id == uploadId);

                if (upload == null)
                {
                    await _auditService.LogActivityAsync(adminId, "Document Extraction Failed", 
                        $"Attempted to extract documents for non-existent upload ID: {uploadId}", 
                        HttpContext, "Upload", uploadId, "Failed", "Upload not found");
                    return NotFound("No uploaded documents found for this upload ID.");
                }

                // 2. Check if files exist
                if (string.IsNullOrEmpty(upload.ECPath) || string.IsNullOrEmpty(upload.AadhaarPath) || string.IsNullOrEmpty(upload.PANPath))
                {
                    await _auditService.LogActivityAsync(adminId, "Document Extraction Failed", 
                        $"Document files missing for upload ID: {uploadId}, User: {upload.User?.FullName}", 
                        HttpContext, "Upload", uploadId, "Failed", "Missing document files");
                    return BadRequest("Some document files are missing from the upload record.");
                }

                if (!System.IO.File.Exists(upload.ECPath) || !System.IO.File.Exists(upload.AadhaarPath) || !System.IO.File.Exists(upload.PANPath))
                {
                    await _auditService.LogActivityAsync(adminId, "Document Extraction Failed", 
                        $"Document files not found on disk for upload ID: {uploadId}, User: {upload.User?.FullName}", 
                        HttpContext, "Upload", uploadId, "Failed", "Files not found on disk");
                    return BadRequest("Document files not found on disk.");
                }

                // 3. Call DLL for extraction
                var ecData = await _documentVerificationDLL.ExtractECAsync(upload.ECPath);
                var aadhaarData = await _documentVerificationDLL.ExtractAadhaarAsync(upload.AadhaarPath);
                var panData = await _documentVerificationDLL.ExtractPANAsync(upload.PANPath);

                // 4. Create ExtractedData record
                var extractedData = new webApitest.Models.ExtractedData
                {
                    UploadId = uploadId,
                    ApplicationNumber = ecData?.ApplicationNumber,
                    ApplicantName = ecData?.Name,
                    ApplicantAddress = ecData?.Address,
                    SurveyNo = ecData?.SurveyNumber,
                    MeasuringArea = ecData?.MeasuringArea,
                    Village = ecData?.Village,
                    Hobli = ecData?.Hobli,
                    Taluk = ecData?.Taluk,
                    District = ecData?.District,
                    AadhaarName = aadhaarData?.Name,
                    AadhaarNo = aadhaarData?.AadhaarNumber,
                    DOB = aadhaarData?.DOB,
                    PANName = panData?.Name,
                    PANNo = panData?.PANNumber,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ExtractedData.Add(extractedData);
                await _context.SaveChangesAsync();

                // Log successful extraction
                await _auditService.LogActivityAsync(adminId, "Document Extraction", 
                    $"Successfully extracted data from documents for User: {upload.User?.FullName} ({upload.User?.Email})", 
                    HttpContext, "Extraction", extractedData.Id, "Success", 
                    $"ExtractedData ID: {extractedData.Id}, Upload ID: {uploadId}");

                _logger.LogInformation($"Document extraction completed for upload {uploadId} by admin. ExtractedData ID: {extractedData.Id}");

                return Ok(new
                {
                    message = "Data extracted successfully",
                    extractedId = extractedData.Id,
                    uploadId = uploadId,
                    userInfo = new
                    {
                        userId = upload.UserId,
                        userName = upload.User?.FullName,
                        userEmail = upload.User?.Email
                    },
                    extractedData = new
                    {
                        ApplicationNumber = extractedData.ApplicationNumber,
                        ApplicantName = extractedData.ApplicantName,
                        AadhaarName = extractedData.AadhaarName,
                        AadhaarNo = extractedData.AadhaarNo,
                        PANName = extractedData.PANName,
                        PANNo = extractedData.PANNo,
                        SurveyNo = extractedData.SurveyNo,
                        Village = extractedData.Village,
                        MeasuringArea = extractedData.MeasuringArea,
                        District = extractedData.District
                    }
                });
            }
            catch (Exception ex)
            {
                // Log failed extraction
                await _auditService.LogActivityAsync(adminId, "Document Extraction Failed", 
                    $"Error extracting documents for upload ID: {uploadId}", 
                    HttpContext, "Upload", uploadId, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, $"Error extracting documents for upload {uploadId}");
                return StatusCode(500, "Internal server error during document extraction");
            }
        }

        [HttpGet("uploaded-documents")]
        [Authorize]
        public async Task<IActionResult> GetUploadedDocuments()
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                var uploadedDocs = await _context.UserUploadedDocuments
                    .Include(u => u.User)
                    .Select(u => new
                    {
                        u.Id,
                        u.UserId,
                        UserName = u.User.FullName,
                        UserEmail = u.User.Email,
                        u.ECPath,
                        u.AadhaarPath,
                        u.PANPath,
                        u.CreatedAt,
                        HasExtractedData = _context.ExtractedData.Any(e => e.UploadId == u.Id),
                        VerificationStatus = _context.VerificationResults
                            .Where(v => v.UploadId == u.Id)
                            .Select(v => v.Status)
                            .FirstOrDefault() ?? "Pending",
                        RiskScore = _context.VerificationResults
                            .Where(v => v.UploadId == u.Id)
                            .Select(v => v.RiskScore)
                            .FirstOrDefault(),
                        IsVerified = _context.VerificationResults
                            .Where(v => v.UploadId == u.Id)
                            .Select(v => v.OverallMatch)
                            .FirstOrDefault() ?? false
                    })
                    .OrderByDescending(u => u.CreatedAt)
                    .ToListAsync();

                // Log admin viewing uploaded documents
                await _auditService.LogActivityAsync(adminId, "View Uploaded Documents", 
                    $"Admin viewed list of uploaded documents. Found {uploadedDocs.Count} documents", 
                    HttpContext, null, null, "Success", 
                    $"Retrieved {uploadedDocs.Count} uploaded documents");

                return Ok(uploadedDocs);
            }
            catch (Exception ex)
            {
                // Log failed retrieval
                await _auditService.LogActivityAsync(adminId, "View Uploaded Documents Failed", 
                    $"Error retrieving uploaded documents", 
                    HttpContext, null, null, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, "Error retrieving uploaded documents");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("verify/{uploadId}")]
        [Authorize]
        public async Task<IActionResult> VerifyDocuments(int uploadId)
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                // Get upload info for audit logging
                var upload = await _context.UserUploadedDocuments
                    .Include(u => u.User)
                    .FirstOrDefaultAsync(u => u.Id == uploadId);

                var result = await _verificationDLL.VerifyAsync(uploadId);
                
                // Log successful verification
                await _auditService.LogActivityAsync(adminId, "Document Verification", 
                    $"Successfully verified documents for User: {upload?.User?.FullName} ({upload?.User?.Email})", 
                    HttpContext, "Verification", uploadId, "Success", 
                    $"Verification completed for Upload ID: {uploadId}");

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log failed verification
                await _auditService.LogActivityAsync(adminId, "Document Verification Failed", 
                    $"Error verifying documents for upload ID: {uploadId}", 
                    HttpContext, "Upload", uploadId, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, $"Error verifying documents for upload {uploadId}");
                return StatusCode(500, "Internal server error during document verification");
            }
        }

        [HttpGet("extracted-data/{uploadId}")]
        [Authorize]
        public async Task<IActionResult> GetExtractedData(int uploadId)
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                // Get the uploaded document record
                var upload = await _context.UserUploadedDocuments
                    .Include(u => u.User)
                    .FirstOrDefaultAsync(u => u.Id == uploadId);

                if (upload == null)
                {
                    return NotFound("Upload record not found");
                }

                // Get extracted data for this upload
                var extractedData = await _context.ExtractedData
                    .FirstOrDefaultAsync(e => e.UploadId == uploadId);

                if (extractedData == null)
                {
                    return NotFound("No extracted data found for this upload");
                }

                // Log admin viewing extracted data
                await _auditService.LogActivityAsync(adminId, "View Extracted Data", 
                    $"Admin viewed extracted data for upload ID: {uploadId}, User: {upload.User?.FullName}", 
                    HttpContext, "ExtractedData", extractedData.Id, "Success", 
                    $"Retrieved extracted data for upload {uploadId}");

                return Ok(new
                {
                    UploadId = uploadId,
                    UserName = upload.User?.FullName,
                    UserEmail = upload.User?.Email,
                    UploadedAt = upload.CreatedAt,
                    ExtractedAt = extractedData.CreatedAt,
                    ExtractedData = new
                    {
                        Id = extractedData.Id,
                        aadhaarData = new
                        {
                            name = extractedData.AadhaarName,
                            number = extractedData.AadhaarNo,
                            dob = extractedData.DOB,
                            hasData = !string.IsNullOrEmpty(extractedData.AadhaarName) || !string.IsNullOrEmpty(extractedData.AadhaarNo)
                        },
                        panData = new
                        {
                            name = extractedData.PANName,
                            number = extractedData.PANNo,
                            dob = extractedData.DOB,
                            hasData = !string.IsNullOrEmpty(extractedData.PANName) || !string.IsNullOrEmpty(extractedData.PANNo)
                        },
                        applicationData = new
                        {
                            applicationNumber = extractedData.ApplicationNumber,
                            applicantName = extractedData.ApplicantName,
                            applicantAddress = extractedData.ApplicantAddress,
                            hasData = !string.IsNullOrEmpty(extractedData.ApplicationNumber) || !string.IsNullOrEmpty(extractedData.ApplicantName)
                        },
                        surveyData = new
                        {
                            surveyNo = extractedData.SurveyNo,
                            measuringArea = extractedData.MeasuringArea,
                            village = extractedData.Village,
                            hobli = extractedData.Hobli,
                            taluk = extractedData.Taluk,
                            district = extractedData.District,
                            hasData = !string.IsNullOrEmpty(extractedData.SurveyNo) || 
                                     !string.IsNullOrEmpty(extractedData.Village) ||
                                     !string.IsNullOrEmpty(extractedData.Hobli) ||
                                     !string.IsNullOrEmpty(extractedData.Taluk) ||
                                     !string.IsNullOrEmpty(extractedData.District)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                // Log failed retrieval
                await _auditService.LogActivityAsync(adminId, "View Extracted Data Failed", 
                    $"Error retrieving extracted data for upload ID: {uploadId}", 
                    HttpContext, "ExtractedData", uploadId, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, $"Error retrieving extracted data for upload {uploadId}");
                return StatusCode(500, "Internal server error while retrieving extracted data");
            }
        }

        [HttpGet("verification-results/{uploadId}")]
        [Authorize]
        public async Task<IActionResult> GetVerificationResults(int uploadId)
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                _logger.LogInformation($"Getting verification results for uploadId: {uploadId}");
                // Get the uploaded document record
                var upload = await _context.UserUploadedDocuments
                    .Include(u => u.User)
                    .FirstOrDefaultAsync(u => u.Id == uploadId);

                if (upload == null)
                {
                    _logger.LogWarning($"Upload record not found for uploadId: {uploadId}");
                    return NotFound("Upload record not found");
                }

                _logger.LogInformation($"Found upload record for user: {upload.User?.FullName}");

                // Get extracted data
                var extractedData = await _context.ExtractedData
                    .FirstOrDefaultAsync(e => e.UploadId == uploadId);

                if (extractedData == null)
                {
                    _logger.LogWarning($"No extracted data found for uploadId: {uploadId}");
                    return NotFound("No extracted data found for this upload");
                }

                _logger.LogInformation($"Found extracted data for uploadId: {uploadId}");

                // Get verification results
                var verificationResult = await _context.VerificationResults
                    .FirstOrDefaultAsync(v => v.UploadId == uploadId);

                if (verificationResult == null)
                {
                    _logger.LogWarning($"No verification results found for uploadId: {uploadId}");
                    return NotFound("No verification results found for this upload");
                }

                _logger.LogInformation($"Found verification results for uploadId: {uploadId}, Status: {verificationResult.Status}");

                // Smart verification: Find matching records in original tables
                _logger.LogInformation("Starting smart verification process...");
                _logger.LogInformation($"Extracted Survey Number: '{extractedData.SurveyNo}'");
                
                // Debug: Check if OriginalECData table has any records at all
                var totalECRecords = await _context.OriginalECData.CountAsync();
                _logger.LogInformation($"Total records in OriginalECData table: {totalECRecords}");
                
                // Test: Check if smart verification is running
                _logger.LogInformation("Smart verification is running - this should appear in logs");
                _logger.LogInformation($"Smart verification DEBUG - SurveyNo: '{extractedData.SurveyNo}', IsNullOrEmpty: {string.IsNullOrEmpty(extractedData.SurveyNo)}");
                
                string originalAadhaarName = "Data Not Available";
                string originalAadhaarNo = "Data Not Available";
                string originalDOB = "Data Not Available";
                string originalPANName = "Data Not Available";
                string originalPANNo = "Data Not Available";
                string originalSurveyNo = "Data Not Available";
                string originalVillage = "Data Not Available";
                string originalDistrict = "Data Not Available";
                string originalMeasuringArea = "Data Not Available";
                string originalHobli = "Data Not Available";
                string originalTaluk = "Data Not Available";
                
                // Store the originalEC record for additional fields
                OriginalECData originalEC = null;
                
                try
                {
                    _logger.LogInformation("Starting Step 1: Aadhaar lookup");
                    // Step 1: Find matching Aadhaar record by Aadhaar Number (exact match only)
                    if (!string.IsNullOrEmpty(extractedData.AadhaarNo))
                    {
                        var originalAadhaar = await _context.OriginalAadhaarData
                            .FirstOrDefaultAsync(a => a.AadhaarNo == extractedData.AadhaarNo);
                        
                        if (originalAadhaar != null)
                        {
                            originalAadhaarName = originalAadhaar.AadhaarName ?? "Data Not Available";
                            originalAadhaarNo = originalAadhaar.AadhaarNo ?? "Data Not Available";
                            originalDOB = originalAadhaar.DOB.ToString("dd/MM/yyyy");
                            _logger.LogInformation($"Found matching Aadhaar record for number: {extractedData.AadhaarNo}");
                        }
                        else
                        {
                            _logger.LogInformation($"No matching Aadhaar record found for number: {extractedData.AadhaarNo}");
                        }
                    }
                    _logger.LogInformation("Step 1 completed successfully");
                    
                    _logger.LogInformation("Starting Step 2: PAN lookup");
                    // Step 2: Find matching PAN record by PAN Number (exact match only)
                    if (!string.IsNullOrEmpty(extractedData.PANNo))
                    {
                        var originalPAN = await _context.OriginalPANData
                            .FirstOrDefaultAsync(p => p.PANNo == extractedData.PANNo);
                        
                        if (originalPAN != null)
                        {
                            originalPANName = originalPAN.PANName ?? "Data Not Available";
                            originalPANNo = originalPAN.PANNo ?? "Data Not Available";
                            _logger.LogInformation($"Found matching PAN record for number: {extractedData.PANNo}");
                        }
                        else
                        {
                            _logger.LogInformation($"No matching PAN record found for number: {extractedData.PANNo}");
                        }
                    }
                    _logger.LogInformation("Step 2 completed successfully");
                    
                    _logger.LogInformation("Starting Step 3: EC lookup");
                    // Step 3: Find matching EC record by Survey Number (exact match only)
                    if (!string.IsNullOrEmpty(extractedData.SurveyNo))
                    {
                        _logger.LogInformation($"Looking for EC record with Survey Number: '{extractedData.SurveyNo}'");
                 
                 try
                 {
                     // Debug: Log the exact query being executed
                     _logger.LogInformation($"Executing query: SELECT * FROM OriginalECData WHERE SurveyNo = '{extractedData.SurveyNo}'");
                     
                     // Robust string comparison - handle whitespace and case sensitivity
                     originalEC = await _context.OriginalECData
                                 .FirstOrDefaultAsync(e => e.SurveyNo == extractedData.SurveyNo);
                     
                     _logger.LogInformation($"Database query result: {(originalEC != null ? "Found" : "Not Found")}");
                     
                     // Debug: Log the exact values being compared
                     _logger.LogInformation($"Comparing: ExtractedSurveyNo='{extractedData.SurveyNo}' (Length: {extractedData.SurveyNo?.Length})");
                     _logger.LogInformation($"Trimmed comparison: '{extractedData.SurveyNo?.Trim()}'");
                 
                     if (originalEC != null)
                     {
                         originalSurveyNo = originalEC.SurveyNo ?? "Data Not Available";
                         originalVillage = originalEC.Village ?? "Data Not Available";
                         originalDistrict = originalEC.District ?? "Data Not Available";
                         originalMeasuringArea = originalEC.MeasuringArea ?? "Data Not Available";
                         originalHobli = originalEC.Hobli ?? "Data Not Available";
                         originalTaluk = originalEC.Taluk ?? "Data Not Available";
                         _logger.LogInformation($"Found matching EC record for survey: {extractedData.SurveyNo}");
                         _logger.LogInformation($"EC Data - Survey: {originalEC.SurveyNo}, Village: {originalEC.Village}, District: {originalEC.District}");
                     }
                     else
                     {
                         _logger.LogInformation($"No matching EC record found for survey: {extractedData.SurveyNo}");
                         
                         // Debug: Check what EC records exist
                         var allECRecords = await _context.OriginalECData.ToListAsync();
                         _logger.LogInformation($"Total EC records in database: {allECRecords.Count}");
                         foreach (var ec in allECRecords)
                         {
                             _logger.LogInformation($"EC Record - Survey: '{ec.SurveyNo}' (Length: {ec.SurveyNo?.Length}, Trimmed: '{ec.SurveyNo?.Trim()}'), Village: '{ec.Village}', District: '{ec.District}'");
                         }
                         
                         // Debug: Check if there are any Survey Numbers that contain "78"
                         var similarRecords = allECRecords.Where(ec => ec.SurveyNo != null && ec.SurveyNo.Contains("78")).ToList();
                         _logger.LogInformation($"Records containing '78': {similarRecords.Count}");
                         foreach (var ec in similarRecords)
                         {
                             _logger.LogInformation($"Similar Record - Survey: '{ec.SurveyNo}' (Length: {ec.SurveyNo?.Length})");
                         }
                     }
                 }
                 catch (Exception ex)
                 {
                     _logger.LogError($"Error during EC lookup: {ex.Message}");
                     _logger.LogError($"Exception type: {ex.GetType().Name}");
                     _logger.LogError($"Stack trace: {ex.StackTrace}");
                     
                     // Try a simpler query to test database connectivity
                     try
                     {
                         var simpleCount = await _context.OriginalECData.CountAsync();
                         _logger.LogInformation($"Simple count query successful: {simpleCount} records");
                     }
                     catch (Exception simpleEx)
                     {
                         _logger.LogError($"Even simple query failed: {simpleEx.Message}");
                     }
                 }
             }
                    
                    
                    _logger.LogInformation("Smart verification process completed");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Error during smart verification: {ex.Message}. Using 'Data Not Available' values.");
                }

                // Create field match analysis with actual original data (excluding Application Number and Applicant Name)
                var fieldMatches = new
                {
                    aadhaarName = new
                    {
                        extracted = extractedData.AadhaarName,
                        original = originalAadhaarName,
                        match = verificationResult.AadhaarNameMatch,
                        status = verificationResult.AadhaarNameMatch == true ? "Match" : 
                                verificationResult.AadhaarNameMatch == false ? "Mismatch" : "No Data"
                    },
                    aadhaarNo = new
                    {
                        extracted = extractedData.AadhaarNo,
                        original = originalAadhaarNo,
                        match = verificationResult.AadhaarNoMatch,
                        status = verificationResult.AadhaarNoMatch == true ? "Match" : 
                                verificationResult.AadhaarNoMatch == false ? "Mismatch" : "No Data"
                    },
                    dob = new
                    {
                        extracted = extractedData.DOB,
                        original = originalDOB,
                        match = verificationResult.DOBMatch,
                        status = verificationResult.DOBMatch == true ? "Match" : 
                                verificationResult.DOBMatch == false ? "Mismatch" : "No Data"
                    },
                    panName = new
                    {
                        extracted = extractedData.PANName,
                        original = originalPANName,
                        match = verificationResult.PANNameMatch,
                        status = verificationResult.PANNameMatch == true ? "Match" : 
                                verificationResult.PANNameMatch == false ? "Mismatch" : "No Data"
                    },
                    panNo = new
                    {
                        extracted = extractedData.PANNo,
                        original = originalPANNo,
                        match = verificationResult.PANNoMatch,
                        status = verificationResult.PANNoMatch == true ? "Match" : 
                                verificationResult.PANNoMatch == false ? "Mismatch" : "No Data"
                    },
                    surveyNo = new
                    {
                        extracted = extractedData.SurveyNo,
                        original = originalSurveyNo,
                        match = originalSurveyNo != "Data Not Available" ? 
                            string.Equals(extractedData.SurveyNo?.Trim(), originalSurveyNo?.Trim(), StringComparison.OrdinalIgnoreCase) : false,
                        status = originalSurveyNo != "Data Not Available" ? 
                            (string.Equals(extractedData.SurveyNo?.Trim(), originalSurveyNo?.Trim(), StringComparison.OrdinalIgnoreCase) ? "Match" : "Mismatch") : "No Data"
                    },
                    village = new
                    {
                        extracted = extractedData.Village,
                        original = originalVillage,
                        match = originalVillage != "Data Not Available" ? 
                            string.Equals(extractedData.Village?.Trim(), originalVillage?.Trim(), StringComparison.OrdinalIgnoreCase) : false,
                        status = originalVillage != "Data Not Available" ? 
                            (string.Equals(extractedData.Village?.Trim(), originalVillage?.Trim(), StringComparison.OrdinalIgnoreCase) ? "Match" : "Mismatch") : "No Data"
                    },
                    district = new
                    {
                        extracted = extractedData.District,
                        original = originalDistrict,
                        match = originalDistrict != "Data Not Available" ? 
                            string.Equals(extractedData.District?.Trim(), originalDistrict?.Trim(), StringComparison.OrdinalIgnoreCase) : false,
                        status = originalDistrict != "Data Not Available" ? 
                            (string.Equals(extractedData.District?.Trim(), originalDistrict?.Trim(), StringComparison.OrdinalIgnoreCase) ? "Match" : "Mismatch") : "No Data"
                    },
                    measuringArea = new
                    {
                        extracted = extractedData.MeasuringArea,
                        original = originalMeasuringArea,
                        match = originalMeasuringArea != "Data Not Available" ? 
                            string.Equals(extractedData.MeasuringArea?.Trim(), originalMeasuringArea?.Trim(), StringComparison.OrdinalIgnoreCase) : false,
                        status = originalMeasuringArea != "Data Not Available" ? 
                            (string.Equals(extractedData.MeasuringArea?.Trim(), originalMeasuringArea?.Trim(), StringComparison.OrdinalIgnoreCase) ? "Match" : "Mismatch") : "No Data"
                    },
                    hobli = new
                    {
                        extracted = extractedData.Hobli,
                        original = originalHobli,
                        match = originalHobli != "Data Not Available" ? 
                            string.Equals(extractedData.Hobli?.Trim(), originalHobli?.Trim(), StringComparison.OrdinalIgnoreCase) : false,
                        status = originalHobli != "Data Not Available" ? 
                            (string.Equals(extractedData.Hobli?.Trim(), originalHobli?.Trim(), StringComparison.OrdinalIgnoreCase) ? "Match" : "Mismatch") : "No Data"
                    },
                    taluk = new
                    {
                        extracted = extractedData.Taluk,
                        original = originalTaluk,
                        match = originalTaluk != "Data Not Available" ? 
                            string.Equals(extractedData.Taluk?.Trim(), originalTaluk?.Trim(), StringComparison.OrdinalIgnoreCase) : false,
                        status = originalTaluk != "Data Not Available" ? 
                            (string.Equals(extractedData.Taluk?.Trim(), originalTaluk?.Trim(), StringComparison.OrdinalIgnoreCase) ? "Match" : "Mismatch") : "No Data"
                    },
                    // Additional OriginalECData fields
                    ownerName = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.OwnerName ?? "Data Not Available",
                        match = false,
                        status = originalEC?.OwnerName != null ? "Available" : "No Data"
                    },
                    extent = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.Extent ?? "Data Not Available",
                        match = false,
                        status = originalEC?.Extent != null ? "Available" : "No Data"
                    },
                    landType = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.LandType ?? "Data Not Available",
                        match = false,
                        status = originalEC?.LandType != null ? "Available" : "No Data"
                    },
                    ownershipType = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.OwnershipType ?? "Data Not Available",
                        match = false,
                        status = originalEC?.OwnershipType != null ? "Available" : "No Data"
                    },
                    isMainOwner = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.IsMainOwner == true ? "Yes" : originalEC?.IsMainOwner == false ? "No" : "Data Not Available",
                        match = false,
                        status = originalEC?.IsMainOwner != null ? "Available" : "No Data"
                    },
                    isGovtRestricted = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.IsGovtRestricted == true ? "Yes" : originalEC?.IsGovtRestricted == false ? "No" : "Data Not Available",
                        match = false,
                        status = originalEC?.IsGovtRestricted != null ? "Available" : "No Data"
                    },
                    isCourtStay = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.IsCourtStay == true ? "Yes" : originalEC?.IsCourtStay == false ? "No" : "Data Not Available",
                        match = false,
                        status = originalEC?.IsCourtStay != null ? "Available" : "No Data"
                    },
                    isAlienated = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.IsAlienated == true ? "Yes" : originalEC?.IsAlienated == false ? "No" : "Data Not Available",
                        match = false,
                        status = originalEC?.IsAlienated != null ? "Available" : "No Data"
                    },
                    anyTransaction = new
                    {
                        extracted = "N/A", // Not available in extracted data
                        original = originalEC?.AnyTransaction == true ? "Yes" : originalEC?.AnyTransaction == false ? "No" : "Data Not Available",
                        match = false,
                        status = originalEC?.AnyTransaction != null ? "Available" : "No Data"
                    }
                };

                // Calculate match statistics (including new fields: Measuring Area, Hobli, Taluk)
                var totalFields = 11; // Total number of fields being compared
                var matchedFields = new[] {
                    verificationResult.AadhaarNameMatch,
                    verificationResult.AadhaarNoMatch,
                    verificationResult.DOBMatch,
                    verificationResult.PANNameMatch,
                    verificationResult.PANNoMatch,
                    verificationResult.SurveyNoMatch,
                    verificationResult.VillageMatch,
                    verificationResult.DistrictMatch,
                    verificationResult.MeasuringAreaMatch,
                    verificationResult.HobliMatch,
                    verificationResult.TalukMatch
                }.Count(m => m == true);

                var mismatchedFields = new[] {
                    verificationResult.AadhaarNameMatch,
                    verificationResult.AadhaarNoMatch,
                    verificationResult.DOBMatch,
                    verificationResult.PANNameMatch,
                    verificationResult.PANNoMatch,
                    verificationResult.SurveyNoMatch,
                    verificationResult.VillageMatch,
                    verificationResult.DistrictMatch,
                    verificationResult.MeasuringAreaMatch,
                    verificationResult.HobliMatch,
                    verificationResult.TalukMatch
                }.Count(m => m == false);

                var noDataFields = totalFields - matchedFields - mismatchedFields;
                var matchPercentage = totalFields > 0 ? (matchedFields * 100.0 / totalFields) : 0;

                // Log admin viewing verification results
                await _auditService.LogActivityAsync(adminId, "View Verification Results", 
                    $"Admin viewed verification results for upload ID: {uploadId}, User: {upload.User?.FullName}", 
                    HttpContext, "VerificationResults", verificationResult.Id, "Success", 
                    $"Retrieved verification results for upload {uploadId}");

                // Debug: Log smart verification results
                _logger.LogInformation($"Smart verification results - SurveyNo: {originalSurveyNo}, Village: {originalVillage}, District: {originalDistrict}");
                
                // Debug: Test if smart verification is working
                if (originalSurveyNo == "Data Not Available")
                {
                    _logger.LogWarning("Smart verification failed - all EC fields show 'Data Not Available'");
                    _logger.LogWarning($"This means the smart verification logic is not finding the EC record for Survey Number: {extractedData.SurveyNo}");
                }
                else
                {
                    _logger.LogInformation("Smart verification successful - found original data");
                }
                
                // Debug: Check if smart verification was executed
                _logger.LogInformation($"Smart verification execution check - SurveyNo: {originalSurveyNo}");

                return Ok(new
                {
                    UploadId = uploadId,
                    UserName = upload.User?.FullName,
                    UserEmail = upload.User?.Email,
                    UploadedAt = upload.CreatedAt,
                    VerifiedAt = verificationResult.VerifiedAt,
                    VerificationStatus = verificationResult.Status,
                    RiskScore = verificationResult.RiskScore,
                    OverallMatch = verificationResult.OverallMatch,
                    FieldMatches = fieldMatches,
                    Statistics = new
                    {
                        TotalFields = totalFields,
                        MatchedFields = matchedFields,
                        MismatchedFields = mismatchedFields,
                        NoDataFields = noDataFields,
                        MatchPercentage = Math.Round(matchPercentage, 2)
                    },
                    RiskLevel = verificationResult.RiskScore >= 80 ? "High Risk" : 
                               verificationResult.RiskScore >= 50 ? "Medium Risk" : "Low Risk"
                });
            }
            catch (Exception ex)
            {
                // Log failed retrieval
                await _auditService.LogActivityAsync(adminId, "View Verification Results Failed", 
                    $"Error retrieving verification results for upload ID: {uploadId}", 
                    HttpContext, "VerificationResults", uploadId, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, $"Error retrieving verification results for upload {uploadId}. Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error while retrieving verification results: {ex.Message}");
            }
        }

        [HttpGet("analytics")]
        [Authorize]
        public async Task<IActionResult> GetAnalytics()
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                // Get user statistics
                var totalUsers = await _context.Users.CountAsync();
                var totalAdmins = await _context.Users.CountAsync(u => u.Role == "Admin");
                var totalRegularUsers = totalUsers - totalAdmins;

                // Get document statistics
                var totalUploads = await _context.UserUploadedDocuments.CountAsync();
                var submittedUploads = await _context.UserUploadedDocuments.CountAsync();
                var verifiedUploads = await _context.VerificationResults.CountAsync(v => v.Status == "Verified");
                var pendingVerification = await _context.VerificationResults.CountAsync(v => v.Status == "Pending");
                var rejectedUploads = await _context.VerificationResults.CountAsync(v => v.Status == "Rejected");

                // Get verification counts
                var verifiedCount = verifiedUploads;
                var pendingCount = pendingVerification;
                var rejectedCount = rejectedUploads;

                // Get recent activity (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var recentUploads = await _context.UserUploadedDocuments
                    .CountAsync(u => u.CreatedAt >= thirtyDaysAgo);
                var recentVerifications = await _context.VerificationResults
                    .CountAsync(v => v.VerifiedAt >= thirtyDaysAgo);

                // Get risk score distribution
                var highRiskCount = await _context.VerificationResults
                    .CountAsync(v => v.RiskScore >= 80);
                var mediumRiskCount = await _context.VerificationResults
                    .CountAsync(v => v.RiskScore >= 50 && v.RiskScore < 80);
                var lowRiskCount = await _context.VerificationResults
                    .CountAsync(v => v.RiskScore < 50);

                // Log admin viewing analytics
                await _auditService.LogActivityAsync(adminId, "View Analytics", 
                    $"Admin viewed system analytics dashboard", 
                    HttpContext, null, null, "Success", 
                    "Retrieved analytics data");

                var analytics = new
                {
                    UserStats = new
                    {
                        TotalUsers = totalUsers,
                        TotalAdmins = totalAdmins,
                        TotalRegularUsers = totalRegularUsers
                    },
                    DocumentStats = new
                    {
                        TotalUploads = totalUploads,
                        SubmittedUploads = submittedUploads,
                        VerifiedUploads = verifiedUploads,
                        PendingVerification = pendingVerification,
                        RejectedUploads = rejectedUploads
                    },
                    VerificationStats = new
                    {
                        VerifiedCount = verifiedCount,
                        PendingCount = pendingCount,
                        RejectedCount = rejectedCount
                    },
                    RecentActivity = new
                    {
                        RecentUploads = recentUploads,
                        RecentVerifications = recentVerifications
                    },
                    RiskDistribution = new
                    {
                        HighRisk = highRiskCount,
                        MediumRisk = mediumRiskCount,
                        LowRisk = lowRiskCount
                    }
                };

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                // Log failed retrieval
                await _auditService.LogActivityAsync(adminId, "View Analytics Failed", 
                    $"Error retrieving analytics data", 
                    HttpContext, null, null, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, "Error retrieving analytics data");
                return StatusCode(500, "Internal server error while retrieving analytics");
            }
        }

        [HttpGet("users/{userId}/documents")]
        [Authorize]
        public async Task<IActionResult> GetUserDocuments(int userId)
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                // Get user information
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Get all documents uploaded by this user
                var userDocs = await _context.UserUploadedDocuments
                    .Where(u => u.UserId == userId)
                    .Select(u => new
                    {
                        u.Id,
                        u.UserId,
                        u.ECPath,
                        u.AadhaarPath,
                        u.PANPath,
                        u.CreatedAt,
                        HasExtractedData = _context.ExtractedData.Any(e => e.UploadId == u.Id),
                        VerificationStatus = _context.VerificationResults
                            .Where(v => v.UploadId == u.Id)
                            .Select(v => v.Status)
                            .FirstOrDefault() ?? "Pending",
                        RiskScore = _context.VerificationResults
                            .Where(v => v.UploadId == u.Id)
                            .Select(v => v.RiskScore)
                            .FirstOrDefault(),
                        IsVerified = _context.VerificationResults
                            .Where(v => v.UploadId == u.Id)
                            .Select(v => v.OverallMatch)
                            .FirstOrDefault() ?? false
                    })
                    .OrderByDescending(u => u.CreatedAt)
                    .ToListAsync();

                // Log admin viewing user documents
                await _auditService.LogActivityAsync(adminId, "View User Documents", 
                    $"Admin viewed documents for user: {user.FullName} ({user.Email})", 
                    HttpContext, "User", userId, "Success", 
                    $"Retrieved {userDocs.Count} documents for user {user.FullName}");

                return Ok(new
                {
                    User = new
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        Role = user.Role
                    },
                    Documents = userDocs
                });
            }
            catch (Exception ex)
            {
                // Log failed retrieval
                await _auditService.LogActivityAsync(adminId, "View User Documents Failed", 
                    $"Error retrieving documents for user ID: {userId}", 
                    HttpContext, "User", userId, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, $"Error retrieving documents for user {userId}");
                return StatusCode(500, "Internal server error while retrieving user documents");
            }
        }
        // Get geolocation data (Admin only)
        [HttpGet("geolocation/{uploadId}")]
        [Authorize]
        public async Task<IActionResult> GetGeoLocation(int uploadId)
        {
            var adminId = GetCurrentAdminId();
            
            try
            {
                var upload = await _context.UserUploadedDocuments
                    .Include(u => u.User)
                    .FirstOrDefaultAsync(u => u.Id == uploadId);

                if (upload == null)
                {
                    return NotFound("Upload not found");
                }

                // Get extracted data for this upload
                var extractedData = await _context.ExtractedData
                    .FirstOrDefaultAsync(e => e.UploadId == uploadId);

                // Use actual extracted data if available, otherwise use default values
                var geoLocationData = new
                {
                    UploadId = uploadId,
                    UserName = upload.User?.FullName,
                    Village = !string.IsNullOrEmpty(extractedData?.Village) ? extractedData.Village : "Not Available",
                    Hobli = !string.IsNullOrEmpty(extractedData?.Hobli) ? extractedData.Hobli : "Not Available",
                    Taluk = !string.IsNullOrEmpty(extractedData?.Taluk) ? extractedData.Taluk : "Not Available",
                    District = !string.IsNullOrEmpty(extractedData?.District) ? extractedData.District : "Not Available",
                    State = "Karnataka", // Default state
                    Pincode = "Not Available",
                    Coordinates = new
                    {
                        Latitude = 12.9716, // Default coordinates (Bangalore)
                        Longitude = 77.5946
                    },
                    ExtractedAt = extractedData?.CreatedAt ?? DateTime.UtcNow,
                    HasRealData = extractedData != null && !string.IsNullOrEmpty(extractedData.Village)
                };

                // Log geolocation data retrieval
                await _auditService.LogActivityAsync(adminId, "View Geolocation Data", 
                    $"Admin viewed geolocation data for upload ID: {uploadId}, User: {upload.User?.FullName}", 
                    HttpContext, "Geolocation", uploadId, "Success", 
                    $"Retrieved geolocation data for upload {uploadId}");

                return Ok(geoLocationData);
            }
            catch (Exception ex)
            {
                // Log failed retrieval
                await _auditService.LogActivityAsync(adminId, "View Geolocation Data Failed", 
                    $"Error retrieving geolocation data for upload ID: {uploadId}", 
                    HttpContext, "Geolocation", uploadId, "Failed", $"Error: {ex.Message}");
                
                _logger.LogError(ex, $"Error retrieving geolocation data for upload {uploadId}");
                return StatusCode(500, "Internal server error while retrieving geolocation data");
            }
        }
    }
}