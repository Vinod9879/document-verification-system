namespace webApitest.Models.DTOs
{
    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty; // "User" or "Admin"
    }

    public class UserManagementDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool HasUploadedDocuments { get; set; }
    }

    public class DocumentManagementDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public bool IsSubmitted { get; set; }
        public bool IsVerified { get; set; }
        public decimal RiskScore { get; set; }
        public string? VerificationNotes { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool HasEC { get; set; }
        public bool HasAadhaar { get; set; }
        public bool HasPAN { get; set; }
    }

    public class AnalyticsDto
    {
        public UserStatsDto UserStats { get; set; } = new();
        public DocumentStatsDto DocumentStats { get; set; } = new();
        public RiskScoreSummaryDto RiskScoreSummary { get; set; } = new();
        public List<UploadTrendDto> UploadTrends { get; set; } = new();
        public List<ActivityLogDto> RecentActivity { get; set; } = new();
    }

    public class UserStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalAdmins { get; set; }
        public int TotalRegularUsers { get; set; }
    }

    public class DocumentStatsDto
    {
        public int TotalUploads { get; set; }
        public int SubmittedUploads { get; set; }
        public int VerifiedUploads { get; set; }
        public int PendingVerification { get; set; }
    }

    public class RiskScoreSummaryDto
    {
        public int LowRisk { get; set; }
        public int MediumRisk { get; set; }
        public int HighRisk { get; set; }
    }

    public class UploadTrendDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class ActivityLogDto
    {
        public string Activity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string UserEmail { get; set; } = string.Empty;
    }
}
