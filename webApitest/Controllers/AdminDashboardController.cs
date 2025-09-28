using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using webApitest.Data;
using webApitest.Models;
using webApitest.Services;
using DocumentVerificationDLL;
using VerificationDLL;
using System.Security.Claims;
using webApitest.DTOs;

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
                        AadhaarData = new
                        {
                            Name = extractedData.AadhaarName,
                            Number = extractedData.AadhaarNo,
                            DOB = extractedData.DOB,
                            HasData = !string.IsNullOrEmpty(extractedData.AadhaarName) || !string.IsNullOrEmpty(extractedData.AadhaarNo)
                        },
                        PANData = new
                        {
                            Name = extractedData.PANName,
                            Number = extractedData.PANNo,
                            HasData = !string.IsNullOrEmpty(extractedData.PANName) || !string.IsNullOrEmpty(extractedData.PANNo)
                        },
                        ApplicationData = new
                        {
                            ApplicationNumber = extractedData.ApplicationNumber,
                            ApplicantName = extractedData.ApplicantName,
                            ApplicantAddress = extractedData.ApplicantAddress,
                            HasData = !string.IsNullOrEmpty(extractedData.ApplicationNumber) || !string.IsNullOrEmpty(extractedData.ApplicantName)
                        },
                        SurveyData = new
                        {
                            SurveyNo = extractedData.SurveyNo,
                            MeasuringArea = extractedData.MeasuringArea,
                            Village = extractedData.Village,
                            Hobli = extractedData.Hobli,
                            Taluk = extractedData.Taluk,
                            District = extractedData.District,
                            HasData = !string.IsNullOrEmpty(extractedData.SurveyNo) || !string.IsNullOrEmpty(extractedData.Village)
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
    }
}