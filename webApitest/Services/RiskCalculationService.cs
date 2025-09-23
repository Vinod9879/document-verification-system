using webApitest.Models;
using webApitest.Models.DTOs;
using System.Text.Json;

namespace webApitest.Services
{
    public interface IRiskCalculationService
    {
        Task<RiskScoreResult> CalculateRiskScoreAsync(int uploadedDocumentId);
        decimal CalculateFieldMismatchRisk(ExtractedDataDto uploaded, ExtractedDataDto original);
        decimal CalculateDocumentQualityRisk(string documentPath);
        decimal CalculateConsistencyRisk(ExtractedDataDto ecData, ExtractedDataDto aadhaarData, ExtractedDataDto panData);
    }

    public class RiskCalculationService : IRiskCalculationService
    {
        private readonly ILogger<RiskCalculationService> _logger;

        public RiskCalculationService(ILogger<RiskCalculationService> logger)
        {
            _logger = logger;
        }

        public async Task<RiskScoreResult> CalculateRiskScoreAsync(int uploadedDocumentId)
        {
            try
            {
                // This would be called from your DLL verification function
                // The actual risk calculation logic should be implemented here
                
                _logger.LogInformation($"Calculating risk score for upload ID: {uploadedDocumentId}");
                
                // TODO: Replace with actual DLL call
                // var result = YourDLL.VerifyDocuments(uploadedEC, originalEC, uploadedAadhaar, originalAadhaar, uploadedPAN, originalPAN);
                
                // Placeholder implementation
                await Task.Delay(1000);
                
                return new RiskScoreResult
                {
                    TotalRiskScore = 25.5m,
                    FieldMismatchRisk = 15.0m,
                    DocumentQualityRisk = 5.0m,
                    ConsistencyRisk = 5.5m,
                    VerificationNotes = "Documents verified with minor discrepancies",
                    FieldMismatches = "Name spelling difference in PAN document"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error calculating risk score for upload ID: {uploadedDocumentId}");
                throw;
            }
        }

        public decimal CalculateFieldMismatchRisk(ExtractedDataDto uploaded, ExtractedDataDto original)
        {
            decimal riskScore = 0;
            var mismatches = new List<string>();

            // Name comparison (Weight: 30%)
            if (!string.IsNullOrEmpty(uploaded.Name) && !string.IsNullOrEmpty(original.Name))
            {
                var nameSimilarity = CalculateStringSimilarity(uploaded.Name, original.Name);
                if (nameSimilarity < 0.8m) // Less than 80% similarity
                {
                    riskScore += 30;
                    mismatches.Add($"Name mismatch: '{uploaded.Name}' vs '{original.Name}'");
                }
            }

            // DOB comparison (Weight: 25%)
            if (!string.IsNullOrEmpty(uploaded.DOB) && !string.IsNullOrEmpty(original.DOB))
            {
                if (uploaded.DOB != original.DOB)
                {
                    riskScore += 25;
                    mismatches.Add($"DOB mismatch: '{uploaded.DOB}' vs '{original.DOB}'");
                }
            }

            // PAN Number comparison (Weight: 20%)
            if (!string.IsNullOrEmpty(uploaded.PANNumber) && !string.IsNullOrEmpty(original.PANNumber))
            {
                if (uploaded.PANNumber != original.PANNumber)
                {
                    riskScore += 20;
                    mismatches.Add($"PAN mismatch: '{uploaded.PANNumber}' vs '{original.PANNumber}'");
                }
            }

            // Aadhaar Number comparison (Weight: 15%)
            if (!string.IsNullOrEmpty(uploaded.AadhaarNumber) && !string.IsNullOrEmpty(original.AadhaarNumber))
            {
                if (uploaded.AadhaarNumber != original.AadhaarNumber)
                {
                    riskScore += 15;
                    mismatches.Add($"Aadhaar mismatch: '{uploaded.AadhaarNumber}' vs '{original.AadhaarNumber}'");
                }
            }

            // Address comparison (Weight: 10%)
            if (!string.IsNullOrEmpty(uploaded.Address) && !string.IsNullOrEmpty(original.Address))
            {
                var addressSimilarity = CalculateStringSimilarity(uploaded.Address, original.Address);
                if (addressSimilarity < 0.7m) // Less than 70% similarity
                {
                    riskScore += 10;
                    mismatches.Add($"Address mismatch: '{uploaded.Address}' vs '{original.Address}'");
                }
            }

            return Math.Min(riskScore, 100); // Cap at 100
        }

        public decimal CalculateDocumentQualityRisk(string documentPath)
        {
            decimal riskScore = 0;

            try
            {
                // Check if file exists
                if (!File.Exists(documentPath))
                {
                    return 100; // Maximum risk if file doesn't exist
                }

                var fileInfo = new FileInfo(documentPath);
                
                // File size check (too small might indicate poor quality)
                if (fileInfo.Length < 50000) // Less than 50KB
                {
                    riskScore += 20;
                }

                // File age check (very old files might be outdated)
                var fileAge = DateTime.UtcNow - fileInfo.CreationTime;
                if (fileAge.TotalDays > 365) // Older than 1 year
                {
                    riskScore += 15;
                }

                // TODO: Add more quality checks like:
                // - Image resolution
                // - Text clarity
                // - Document completeness
                // - OCR confidence score

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking document quality for: {documentPath}");
                riskScore += 50; // High risk if we can't assess quality
            }

            return Math.Min(riskScore, 100);
        }

        public decimal CalculateConsistencyRisk(ExtractedDataDto ecData, ExtractedDataDto aadhaarData, ExtractedDataDto panData)
        {
            decimal riskScore = 0;
            var inconsistencies = new List<string>();

            // Name consistency across all documents
            var names = new[] { ecData.Name, aadhaarData.Name, panData.Name }
                .Where(n => !string.IsNullOrEmpty(n))
                .Distinct()
                .ToList();

            if (names.Count > 1)
            {
                riskScore += 30;
                inconsistencies.Add($"Name inconsistency across documents: {string.Join(", ", names)}");
            }

            // DOB consistency across all documents
            var dobs = new[] { ecData.DOB, aadhaarData.DOB, panData.DOB }
                .Where(d => !string.IsNullOrEmpty(d))
                .Distinct()
                .ToList();

            if (dobs.Count > 1)
            {
                riskScore += 25;
                inconsistencies.Add($"DOB inconsistency across documents: {string.Join(", ", dobs)}");
            }

            // Address consistency
            var addresses = new[] { ecData.Address, aadhaarData.Address }
                .Where(a => !string.IsNullOrEmpty(a))
                .Distinct()
                .ToList();

            if (addresses.Count > 1)
            {
                riskScore += 20;
                inconsistencies.Add($"Address inconsistency across documents: {string.Join(", ", addresses)}");
            }

            return Math.Min(riskScore, 100);
        }

        private decimal CalculateStringSimilarity(string str1, string str2)
        {
            if (string.IsNullOrEmpty(str1) || string.IsNullOrEmpty(str2))
                return 0;

            // Simple Levenshtein distance calculation
            var distance = LevenshteinDistance(str1.ToLower(), str2.ToLower());
            var maxLength = Math.Max(str1.Length, str2.Length);
            
            return maxLength == 0 ? 1 : (decimal)(maxLength - distance) / maxLength;
        }

        private int LevenshteinDistance(string str1, string str2)
        {
            var matrix = new int[str1.Length + 1, str2.Length + 1];

            for (int i = 0; i <= str1.Length; i++)
                matrix[i, 0] = i;

            for (int j = 0; j <= str2.Length; j++)
                matrix[0, j] = j;

            for (int i = 1; i <= str1.Length; i++)
            {
                for (int j = 1; j <= str2.Length; j++)
                {
                    var cost = str1[i - 1] == str2[j - 1] ? 0 : 1;
                    matrix[i, j] = Math.Min(
                        Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                        matrix[i - 1, j - 1] + cost);
                }
            }

            return matrix[str1.Length, str2.Length];
        }
    }

    public class RiskScoreResult
    {
        public decimal TotalRiskScore { get; set; }
        public decimal FieldMismatchRisk { get; set; }
        public decimal DocumentQualityRisk { get; set; }
        public decimal ConsistencyRisk { get; set; }
        public string? VerificationNotes { get; set; }
        public string? FieldMismatches { get; set; }
    }
}
