using System.ComponentModel.DataAnnotations;

namespace webApitest.Models
{
    public class UserUploadedDocuments
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        // Document file paths
        public string? ECPath { get; set; }
        public string? AadhaarPath { get; set; }
        public string? PANPath { get; set; }
        
        // Extracted data from DLL
        public string? ExtractedData { get; set; } // JSON string of extracted fields
        
        // Verification status
        public bool IsVerified { get; set; } = false;
        public decimal RiskScore { get; set; } = 0;
        public string? VerificationNotes { get; set; }
        
        // Submission tracking
        public bool IsSubmitted { get; set; } = false;
        public DateTime SubmittedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Field mismatches for display
        public string? FieldMismatches { get; set; } // JSON string of mismatched fields
    }
}
