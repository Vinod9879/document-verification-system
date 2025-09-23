using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webApitest.Data;
using webApitest.Models;
using webApitest.Models.DTOs;
using webApitest.DTOs;
using webApitest.Services;
using System.Security.Claims;
using System.Text.Json;

namespace webApitest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminDashboardController> _logger;
        private readonly IDocumentExtractionService _documentExtractionService;

        public AdminDashboardController(ApplicationDbContext context, ILogger<AdminDashboardController> logger, IDocumentExtractionService documentExtractionService)
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

        // Check if current user is admin
        private async Task<bool> IsAdminUser()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);
            return user?.Role == "Admin";
        }

        // 1. User Management - Get all users
        [HttpGet("users")]
        public async Task<ActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var users = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
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
                        u.CreatedAt,
                        u.UpdatedAt,
                        HasUploadedDocuments = _context.UserUploadedDocuments.Any(ud => ud.UserId == u.Id)
                    })
                    .ToListAsync();

                var totalUsers = await _context.Users.CountAsync();

                return Ok(new
                {
                    users,
                    totalUsers,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, "Internal server error");
            }
        }

        // 2. Get specific user details
        [HttpGet("users/{userId}")]
        public async Task<ActionResult> GetUserDetails(int userId)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var user = await _context.Users
                    .Where(u => u.Id == userId)
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
                        u.CreatedAt,
                        u.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound("User not found");

                // Get user's uploaded documents
                var uploadedDocs = await _context.UserUploadedDocuments
                    .Where(ud => ud.UserId == userId)
                    .Select(ud => new
                    {
                        ud.Id,
                        ud.IsSubmitted,
                        ud.IsVerified,
                        ud.RiskScore,
                        ud.VerificationNotes,
                        ud.FieldMismatches,
                        ud.SubmittedAt,
                        ud.CreatedAt
                    })
                    .ToListAsync();

                // Get user activity logs
                var activityLogs = await _context.UserActivityLogs
                    .Where(al => al.UserId == userId)
                    .OrderByDescending(al => al.Timestamp)
                    .Take(10)
                    .Select(al => new
                    {
                        al.Id,
                        al.Activity,
                        al.Description,
                        al.Timestamp
                    })
                    .ToListAsync();

                return Ok(new
                {
                    user,
                    uploadedDocuments = uploadedDocs,
                    recentActivity = activityLogs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user details");
                return StatusCode(500, "Internal server error");
            }
        }

        // 3. Update user role
        [HttpPut("users/{userId}/role")]
        public async Task<ActionResult> UpdateUserRole(int userId, [FromBody] UpdateUserRoleDto roleDto)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound("User not found");

                user.Role = roleDto.Role;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log activity
                await LogAdminActivity($"Updated user {user.Email} role to {roleDto.Role}");

                return Ok(new { message = "User role updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role");
                return StatusCode(500, "Internal server error");
            }
        }

        // 4. Update user details
        [HttpPut("users/{userId}")]
        public async Task<ActionResult> UpdateUser(int userId, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound("User not found");

                // Update user details
                user.FullName = updateDto.FullName;
                user.Email = updateDto.Email;
                user.Phone = updateDto.Phone;
                user.City = updateDto.City;
                user.State = updateDto.State;
                user.Pincode = updateDto.Pincode;
                user.Role = updateDto.Role;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log activity
                await LogAdminActivity($"Updated user {user.Email} details");

                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return StatusCode(500, "Internal server error");
            }
        }

        // 5. Delete user
        [HttpDelete("users/{userId}")]
        public async Task<ActionResult> DeleteUser(int userId)
        {
            try
            {
                _logger.LogInformation($"Delete user request received for user ID: {userId}");
                
                if (!await IsAdminUser())
                {
                    _logger.LogWarning("Delete user request denied - not admin user");
                    return Forbid("Admin access required");
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"User not found with ID: {userId}");
                    return NotFound("User not found");
                }

                // Prevent admin from deleting themselves
                var currentUserId = GetCurrentUserId();
                if (userId == currentUserId)
                {
                    _logger.LogWarning($"Admin attempted to delete themselves: {userId}");
                    return BadRequest("Cannot delete your own account");
                }

                _logger.LogInformation($"Proceeding with deletion of user: {user.Email}");

                // Delete user's uploaded documents first (cascade delete)
                var userDocuments = await _context.UserUploadedDocuments
                    .Where(ud => ud.UserId == userId)
                    .ToListAsync();
                _context.UserUploadedDocuments.RemoveRange(userDocuments);

                // Delete user's activity logs
                var userActivityLogs = await _context.UserActivityLogs
                    .Where(al => al.UserId == userId)
                    .ToListAsync();
                _context.UserActivityLogs.RemoveRange(userActivityLogs);

                // Delete the user
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                // Log activity
                await LogAdminActivity($"Deleted user {user.Email}");

                _logger.LogInformation($"User {user.Email} deleted successfully");
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                return StatusCode(500, "Internal server error");
            }
        }

            // 6. Document Monitoring - Get all uploaded documents
        [HttpGet("documents")]
        public async Task<ActionResult> GetAllUploadedDocuments([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var documents = await _context.UserUploadedDocuments
                    .Include(ud => ud.User)
                    .OrderByDescending(ud => ud.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(ud => new
                    {
                        ud.Id,
                        UserId = ud.UserId,
                        UserName = ud.User.FullName,
                        UserEmail = ud.User.Email,
                        ud.IsSubmitted,
                        ud.IsVerified,
                        ud.RiskScore,
                        ud.VerificationNotes,
                        ud.SubmittedAt,
                        ud.CreatedAt,
                        HasEC = !string.IsNullOrEmpty(ud.ECPath),
                        HasAadhaar = !string.IsNullOrEmpty(ud.AadhaarPath),
                        HasPAN = !string.IsNullOrEmpty(ud.PANPath)
                    })
                    .ToListAsync();

                var totalDocuments = await _context.UserUploadedDocuments.CountAsync();

                return Ok(new
                {
                    documents,
                    totalDocuments,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalDocuments / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all uploaded documents");
                return StatusCode(500, "Internal server error");
            }
        }

            // 7. Get specific document details with extracted data
        [HttpGet("documents/{documentId}")]
        public async Task<ActionResult> GetDocumentDetails(int documentId)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var document = await _context.UserUploadedDocuments
                    .Include(ud => ud.User)
                    .Where(ud => ud.Id == documentId)
                    .Select(ud => new
                    {
                        ud.Id,
                        UserId = ud.UserId,
                        UserName = ud.User.FullName,
                        UserEmail = ud.User.Email,
                        ud.ECPath,
                        ud.AadhaarPath,
                        ud.PANPath,
                        ud.ExtractedData,
                        ud.IsSubmitted,
                        ud.IsVerified,
                        ud.RiskScore,
                        ud.VerificationNotes,
                        ud.FieldMismatches,
                        ud.SubmittedAt,
                        ud.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (document == null)
                    return NotFound("Document not found");

                return Ok(document);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document details");
                return StatusCode(500, "Internal server error");
            }
        }

        // 8. Trigger verification for specific user
        [HttpPost("documents/{documentId}/verify")]
        public async Task<ActionResult> TriggerVerification(int documentId)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var document = await _context.UserUploadedDocuments.FindAsync(documentId);
                if (document == null)
                    return NotFound("Document not found");

                if (!document.IsSubmitted)
                    return BadRequest("Documents not yet submitted");

                // Call DLL verification function
                await CallDLLVerification(document.Id);

                // Log activity
                await LogAdminActivity($"Triggered verification for document {documentId}");

                return Ok(new { message = "Verification process initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering verification");
                return StatusCode(500, "Internal server error");
            }
        }

        // 9. Analytics & Reports
        [HttpGet("analytics")]
        public async Task<ActionResult> GetAnalytics()
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var totalUsers = await _context.Users.CountAsync();
                var totalAdmins = await _context.Users.CountAsync(u => u.Role == "Admin");
                var totalRegularUsers = await _context.Users.CountAsync(u => u.Role == "User");

                var totalUploads = await _context.UserUploadedDocuments.CountAsync();
                var submittedUploads = await _context.UserUploadedDocuments.CountAsync(ud => ud.IsSubmitted);
                var verifiedUploads = await _context.UserUploadedDocuments.CountAsync(ud => ud.IsVerified);

                var pendingVerification = submittedUploads - verifiedUploads;

                // Risk score summary
                var riskScoreSummary = await _context.UserUploadedDocuments
                    .Where(ud => ud.IsVerified)
                    .GroupBy(ud => new
                    {
                        LowRisk = ud.RiskScore <= 30,
                        MediumRisk = ud.RiskScore > 30 && ud.RiskScore <= 70,
                        HighRisk = ud.RiskScore > 70
                    })
                    .Select(g => new
                    {
                        LowRisk = g.Count(x => x.RiskScore <= 30),
                        MediumRisk = g.Count(x => x.RiskScore > 30 && x.RiskScore <= 70),
                        HighRisk = g.Count(x => x.RiskScore > 70)
                    })
                    .FirstOrDefaultAsync();

                // Upload trends (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var uploadTrends = await _context.UserUploadedDocuments
                    .Where(ud => ud.CreatedAt >= thirtyDaysAgo)
                    .GroupBy(ud => ud.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // Recent activity
                var recentActivity = await _context.UserActivityLogs
                    .OrderByDescending(al => al.Timestamp)
                    .Take(20)
                    .Select(al => new
                    {
                        al.Activity,
                        al.Description,
                        al.Timestamp,
                        UserEmail = al.User.Email
                    })
                    .ToListAsync();

                return Ok(new
                {
                    userStats = new
                    {
                        totalUsers,
                        totalAdmins,
                        totalRegularUsers
                    },
                    documentStats = new
                    {
                        totalUploads,
                        submittedUploads,
                        verifiedUploads,
                        pendingVerification
                    },
                    riskScoreSummary = riskScoreSummary ?? new { LowRisk = 0, MediumRisk = 0, HighRisk = 0 },
                    uploadTrends,
                    recentActivity
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        // 10. Download document for audit
        [HttpGet("documents/{documentId}/download/{documentType}")]
        public async Task<ActionResult> DownloadDocument(int documentId, string documentType)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var document = await _context.UserUploadedDocuments.FindAsync(documentId);
                if (document == null)
                    return NotFound("Document not found");

                string? filePath = documentType.ToLower() switch
                {
                    "ec" => document.ECPath,
                    "aadhaar" => document.AadhaarPath,
                    "pan" => document.PANPath,
                    _ => null
                };

                if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
                    return NotFound("Document file not found");

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var fileName = Path.GetFileName(filePath);

                return File(fileBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading document");
                return StatusCode(500, "Internal server error");
            }
        }

            // 11. Get user activity logs
        [HttpGet("activity-logs")]
        public async Task<ActionResult> GetActivityLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (!await IsAdminUser())
                    return Forbid("Admin access required");

                var logs = await _context.UserActivityLogs
                    .Include(al => al.User)
                    .OrderByDescending(al => al.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(al => new
                    {
                        al.Id,
                        al.Activity,
                        al.Description,
                        al.IPAddress,
                        al.UserAgent,
                        al.Timestamp,
                        UserName = al.User.FullName,
                        UserEmail = al.User.Email
                    })
                    .ToListAsync();

                var totalLogs = await _context.UserActivityLogs.CountAsync();

                return Ok(new
                {
                    logs,
                    totalLogs,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalLogs / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting activity logs");
                return StatusCode(500, "Internal server error");
            }
        }

        // Helper method to call DLL verification
        private async Task CallDLLVerification(int documentId)
        {
            try
            {
                var result = await _documentExtractionService.VerifyDocumentsAsync(documentId);
                
                var document = await _context.UserUploadedDocuments.FindAsync(documentId);
                if (document != null)
                {
                    document.IsVerified = result.IsVerified;
                    document.RiskScore = result.RiskScore;
                    document.VerificationNotes = result.VerificationNotes;
                    document.FieldMismatches = result.FieldMismatches;
                    document.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation($"Successfully verified documents for document {documentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verifying documents for document {documentId}");
            }
        }

        // Helper method to log admin activity
        private async Task LogAdminActivity(string description)
        {
            try
            {
                var adminId = GetCurrentUserId();
                var activityLog = new UserActivityLog
                {
                    UserId = adminId,
                    Activity = "Admin Action",
                    Description = description,
                    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
                };

                _context.UserActivityLogs.Add(activityLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging admin activity");
            }
        }
    }
}
