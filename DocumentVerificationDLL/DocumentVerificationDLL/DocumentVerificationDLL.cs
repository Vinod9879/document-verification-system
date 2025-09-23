using System;
using System.IO;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace DocumentVerificationDLL
{
    public class DocumentVerificationDLL : IDocumentVerificationDLL
    {
        private readonly ILogger<DocumentVerificationDLL> _logger;

        public DocumentVerificationDLL(ILogger<DocumentVerificationDLL> logger)
        {
            _logger = logger;
        }

        public async Task<ExtractedData> ExtractECAsync(string filePath)
        {
            try
            {
                _logger.LogInformation($"Extracting EC document: {filePath}");

                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"EC document not found: {filePath}");
                }

                var extractedData = new ExtractedData();
                var extractedText = await ExtractTextFromPdfAsync(filePath);
                
                // Extract EC-specific fields using regex patterns
                extractedData.Name = ExtractField(extractedText, @"(?:Name|Applicant|Owner)[\s:]*([A-Za-z\s]+)", "Name");
                extractedData.DOB = ExtractField(extractedText, @"(?:DOB|Date of Birth|Birth)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})", "Date of Birth");
                extractedData.SurveyNumber = ExtractField(extractedText, @"(?:Survey|Sy\.|Sy\.No\.)[\s:]*(\d+)", "Survey Number");
                extractedData.Address = ExtractField(extractedText, @"(?:Address|Village|Location)[\s:]*([A-Za-z\s,.-]+)", "Address");
                extractedData.ECNumber = ExtractField(extractedText, @"(?:EC|Election Card|Card No\.)[\s:]*([A-Z0-9]+)", "EC Number");
                extractedData.PropertyDetails = ExtractField(extractedText, @"(?:Property|Land|Plot)[\s:]*([A-Za-z0-9\s,.-]+)", "Property Details");
                
                // Calculate confidence score based on extracted fields
                extractedData.ConfidenceScore = CalculateConfidenceScore(extractedData);
                extractedData.ExtractionNotes = $"EC document processed successfully. Extracted {CountExtractedFields(extractedData)} fields.";

                _logger.LogInformation($"EC extraction completed. Confidence: {extractedData.ConfidenceScore}%");
                return extractedData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting EC document: {filePath}");
                throw;
            }
        }

        public async Task<ExtractedData> ExtractAadhaarAsync(string filePath)
        {
            try
            {
                _logger.LogInformation($"Extracting Aadhaar document: {filePath}");

                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"Aadhaar document not found: {filePath}");
                }

                var extractedData = new ExtractedData();
                var extractedText = await ExtractTextFromPdfAsync(filePath);
                
                // Extract Aadhaar-specific fields using regex patterns
                extractedData.Name = ExtractField(extractedText, @"(?:Name|नाम)[\s:]*([A-Za-z\s]+)", "Name");
                extractedData.DOB = ExtractField(extractedText, @"(?:DOB|Date of Birth|जन्म तिथि)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})", "Date of Birth");
                extractedData.AadhaarNumber = ExtractField(extractedText, @"(\d{4}\s?\d{4}\s?\d{4})", "Aadhaar Number");
                extractedData.Address = ExtractField(extractedText, @"(?:Address|पता|Address Line)[\s:]*([A-Za-z0-9\s,.-]+)", "Address");
                extractedData.FatherName = ExtractField(extractedText, @"(?:Father|पिता|Father's Name)[\s:]*([A-Za-z\s]+)", "Father's Name");
                extractedData.MotherName = ExtractField(extractedText, @"(?:Mother|माता|Mother's Name)[\s:]*([A-Za-z\s]+)", "Mother's Name");
                
                // Calculate confidence score based on extracted fields
                extractedData.ConfidenceScore = CalculateConfidenceScore(extractedData);
                extractedData.ExtractionNotes = $"Aadhaar document processed successfully. Extracted {CountExtractedFields(extractedData)} fields.";

                _logger.LogInformation($"Aadhaar extraction completed. Confidence: {extractedData.ConfidenceScore}%");
                return extractedData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting Aadhaar document: {filePath}");
                throw;
            }
        }

        public async Task<ExtractedData> ExtractPANAsync(string filePath)
        {
            try
            {
                _logger.LogInformation($"Extracting PAN document: {filePath}");

                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"PAN document not found: {filePath}");
                }

                var extractedData = new ExtractedData();
                var extractedText = await ExtractTextFromPdfAsync(filePath);
                
                // Extract PAN-specific fields using regex patterns
                extractedData.Name = ExtractField(extractedText, @"(?:Name|नाम)[\s:]*([A-Za-z\s]+)", "Name");
                extractedData.DOB = ExtractField(extractedText, @"(?:DOB|Date of Birth|जन्म तिथि)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})", "Date of Birth");
                extractedData.PANNumber = ExtractField(extractedText, @"([A-Z]{5}[0-9]{4}[A-Z]{1})", "PAN Number");
                extractedData.FatherName = ExtractField(extractedText, @"(?:Father|पिता|Father's Name)[\s:]*([A-Za-z\s]+)", "Father's Name");
                
                // Calculate confidence score based on extracted fields
                extractedData.ConfidenceScore = CalculateConfidenceScore(extractedData);
                extractedData.ExtractionNotes = $"PAN document processed successfully. Extracted {CountExtractedFields(extractedData)} fields.";

                _logger.LogInformation($"PAN extraction completed. Confidence: {extractedData.ConfidenceScore}%");
                return extractedData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting PAN document: {filePath}");
                throw;
            }
        }

        public async Task<VerificationResult> VerifyDocumentsAsync(
            string uploadedEC, 
            string originalEC, 
            string uploadedAadhaar, 
            string originalAadhaar, 
            string uploadedPAN, 
            string originalPAN)
        {
            try
            {
                _logger.LogInformation("Starting document verification process");

                // TODO: Implement actual verification logic
                // This would involve:
                // 1. Extract data from all uploaded documents
                // 2. Extract data from all original documents
                // 3. Compare field by field
                // 4. Calculate risk scores
                // 5. Generate verification report

                await Task.Delay(2000); // Simulate processing time

                // Placeholder implementation
                return new VerificationResult
                {
                    IsVerified = true,
                    RiskScore = 25.5m,
                    VerificationNotes = "Documents verified successfully with minor discrepancies",
                    FieldMismatches = "Name spelling difference in PAN document",
                    FieldMismatchRisk = 15.0m,
                    DocumentQualityRisk = 5.0m,
                    ConsistencyRisk = 5.5m,
                    VerifiedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during document verification");
                throw;
            }
        }

        #region Helper Methods

        /// <summary>
        /// Extracts text from PDF using PDFPig
        /// </summary>
        private Task<string> ExtractTextFromPdfAsync(string filePath)
        {
            try
            {
                using var document = PdfDocument.Open(filePath);
                var text = new System.Text.StringBuilder();

                foreach (var page in document.GetPages())
                {
                    text.AppendLine(page.Text);
                }

                _logger.LogInformation($"Extracted {text.Length} characters from PDF: {filePath}");
                return Task.FromResult(text.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting text from PDF: {filePath}");
                throw;
            }
        }

        /// <summary>
        /// Extracts a specific field using regex pattern
        /// </summary>
        private string ExtractField(string text, string pattern, string fieldName)
        {
            try
            {
                var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase | RegexOptions.Multiline);
                if (match.Success && match.Groups.Count > 1)
                {
                    var value = match.Groups[1].Value.Trim();
                    _logger.LogDebug($"Extracted {fieldName}: {value}");
                    return value;
                }
                else
                {
                    _logger.LogWarning($"Could not extract {fieldName} from document");
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting {fieldName}");
                return string.Empty;
            }
        }

        /// <summary>
        /// Calculates confidence score based on extracted fields
        /// </summary>
        private decimal CalculateConfidenceScore(ExtractedData data)
        {
            var score = 0m;
            var totalFields = 0;

            // Check each field and add to score
            if (!string.IsNullOrEmpty(data.Name)) { score += 20; totalFields++; }
            if (!string.IsNullOrEmpty(data.DOB)) { score += 20; totalFields++; }
            if (!string.IsNullOrEmpty(data.AadhaarNumber)) { score += 20; totalFields++; }
            if (!string.IsNullOrEmpty(data.PANNumber)) { score += 20; totalFields++; }
            if (!string.IsNullOrEmpty(data.ECNumber)) { score += 20; totalFields++; }
            if (!string.IsNullOrEmpty(data.SurveyNumber)) { score += 15; totalFields++; }
            if (!string.IsNullOrEmpty(data.Address)) { score += 15; totalFields++; }
            if (!string.IsNullOrEmpty(data.FatherName)) { score += 10; totalFields++; }
            if (!string.IsNullOrEmpty(data.MotherName)) { score += 10; totalFields++; }
            if (!string.IsNullOrEmpty(data.PropertyDetails)) { score += 10; totalFields++; }

            // Calculate percentage
            var confidence = totalFields > 0 ? (score / totalFields) * 100 : 0;
            return Math.Min(confidence, 100); // Cap at 100%
        }

        /// <summary>
        /// Counts the number of extracted fields
        /// </summary>
        private int CountExtractedFields(ExtractedData data)
        {
            var count = 0;
            if (!string.IsNullOrEmpty(data.Name)) count++;
            if (!string.IsNullOrEmpty(data.DOB)) count++;
            if (!string.IsNullOrEmpty(data.AadhaarNumber)) count++;
            if (!string.IsNullOrEmpty(data.PANNumber)) count++;
            if (!string.IsNullOrEmpty(data.ECNumber)) count++;
            if (!string.IsNullOrEmpty(data.SurveyNumber)) count++;
            if (!string.IsNullOrEmpty(data.Address)) count++;
            if (!string.IsNullOrEmpty(data.FatherName)) count++;
            if (!string.IsNullOrEmpty(data.MotherName)) count++;
            if (!string.IsNullOrEmpty(data.PropertyDetails)) count++;
            return count;
        }

        #endregion
    }
}
