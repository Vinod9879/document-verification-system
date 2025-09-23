using System;
using System.Threading.Tasks;

namespace DocumentVerificationDLL
{
    public interface IDocumentVerificationDLL
    {
        /// <summary>
        /// Extract data from EC (Encumbrance Certificate) document
        /// </summary>
        /// <param name="filePath">Path to the EC PDF file</param>
        /// <returns>Extracted data from EC document</returns>
        Task<ExtractedData> ExtractECAsync(string filePath);

        /// <summary>
        /// Extract data from Aadhaar document
        /// </summary>
        /// <param name="filePath">Path to the Aadhaar PDF file</param>
        /// <returns>Extracted data from Aadhaar document</returns>
        Task<ExtractedData> ExtractAadhaarAsync(string filePath);

        /// <summary>
        /// Extract data from PAN document
        /// </summary>
        /// <param name="filePath">Path to the PAN PDF file</param>
        /// <returns>Extracted data from PAN document</returns>
        Task<ExtractedData> ExtractPANAsync(string filePath);

        /// <summary>
        /// Verify documents by comparing uploaded vs original documents
        /// </summary>
        /// <param name="uploadedEC">Path to uploaded EC document</param>
        /// <param name="originalEC">Path to original EC document</param>
        /// <param name="uploadedAadhaar">Path to uploaded Aadhaar document</param>
        /// <param name="originalAadhaar">Path to original Aadhaar document</param>
        /// <param name="uploadedPAN">Path to uploaded PAN document</param>
        /// <param name="originalPAN">Path to original PAN document</param>
        /// <returns>Verification result with risk score</returns>
        Task<VerificationResult> VerifyDocumentsAsync(
            string uploadedEC, 
            string originalEC, 
            string uploadedAadhaar, 
            string originalAadhaar, 
            string uploadedPAN, 
            string originalPAN);
    }

    public class ExtractedData
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

    public class VerificationResult
    {
        public bool IsVerified { get; set; }
        public decimal RiskScore { get; set; }
        public string? VerificationNotes { get; set; }
        public string? FieldMismatches { get; set; }
        public decimal FieldMismatchRisk { get; set; }
        public decimal DocumentQualityRisk { get; set; }
        public decimal ConsistencyRisk { get; set; }
        public DateTime VerifiedAt { get; set; }
    }
}
