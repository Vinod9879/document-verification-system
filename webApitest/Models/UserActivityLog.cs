using System.ComponentModel.DataAnnotations;

namespace webApitest.Models
{
    public class UserActivityLog
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [StringLength(100)]
        public string Activity { get; set; } = string.Empty; // "Login", "Document Upload", "Verification", etc.
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string? IPAddress { get; set; }
        
        [StringLength(200)]
        public string? UserAgent { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
