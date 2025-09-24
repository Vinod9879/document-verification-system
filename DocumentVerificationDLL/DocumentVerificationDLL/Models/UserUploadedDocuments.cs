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
        
        // User uploaded data fields
        [StringLength(255)]
        public string? Name { get; set; } // General name field
        
        [StringLength(255)]
        public string? AdhaarFullName { get; set; } // Name from Aadhaar document
        
        [StringLength(255)]
        public string? PanFullName { get; set; } // Name from PAN document
        
        [StringLength(20)]
        public string? AdhaarNo { get; set; }
        
        [StringLength(20)]
        public string? Dob { get; set; }
        
        [StringLength(20)]
        public string? PanNo { get; set; }
        
        [StringLength(50)]
        public string? ApplicationNumber { get; set; }
        
        [StringLength(500)]
        public string? ApplicantAddress { get; set; }
        
        [StringLength(50)]
        public string? SurveyNo { get; set; }
        
        [StringLength(50)]
        public string? MeasuringArea { get; set; }
        
        [StringLength(100)]
        public string? Village { get; set; }
        
        [StringLength(100)]
        public string? Hobli { get; set; }
        
        [StringLength(100)]
        public string? Taluk { get; set; }
        
        [StringLength(100)]
        public string? District { get; set; }
        
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
