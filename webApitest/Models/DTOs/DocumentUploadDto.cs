namespace webApitest.Models.DTOs
{
    public class DocumentUploadDto
    {
        public IFormFile? EC { get; set; }
        public IFormFile? Aadhaar { get; set; }
        public IFormFile? PAN { get; set; }
    }

    public class DocumentStatusDto
    {
        public int Id { get; set; }
        public bool IsSubmitted { get; set; }
        public bool IsVerified { get; set; }
        public decimal RiskScore { get; set; }
        public string? VerificationNotes { get; set; }
        public string? FieldMismatches { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ExtractedDataDto
    {
        public string? Name { get; set; }
        public string? DOB { get; set; }
        public string? SurveyNumber { get; set; }
        public string? PANNumber { get; set; }
        public string? AadhaarNumber { get; set; }
        public string? Address { get; set; }
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? ECNumber { get; set; }
        public string? PropertyDetails { get; set; }
        public decimal ConfidenceScore { get; set; }
        public string? ExtractionNotes { get; set; }
    }
}
