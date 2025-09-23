using webApitest.Models;
using webApitest.Models.DTOs;

namespace webApitest.Services
{
    public interface IDocumentExtractionService
    {
        Task<ExtractedDataDto> ExtractECAsync(string filePath);
        Task<ExtractedDataDto> ExtractAadhaarAsync(string filePath);
        Task<ExtractedDataDto> ExtractPANAsync(string filePath);
        Task<VerificationResultDto> VerifyDocumentsAsync(int uploadedDocumentId);
    }

    public class DocumentExtractionService : IDocumentExtractionService
    {
        private readonly ILogger<DocumentExtractionService> _logger;
        private readonly IRiskCalculationService _riskCalculationService;

        public DocumentExtractionService(ILogger<DocumentExtractionService> logger, IRiskCalculationService riskCalculationService)
        {
            _logger = logger;
            _riskCalculationService = riskCalculationService;
        }

        public async Task<ExtractedDataDto> ExtractECAsync(string filePath)
        {
            try
            {
                _logger.LogInformation($"Extracting EC document: {filePath}");
                
                // Call DLL for EC extraction
                var dll = new DocumentVerificationDLL.DocumentVerificationDLL(_logger as Microsoft.Extensions.Logging.ILogger<DocumentVerificationDLL.DocumentVerificationDLL>);
                var extractedData = await dll.ExtractECAsync(filePath);
                
                return new ExtractedDataDto
                {
                    Name = extractedData.Name,
                    DOB = extractedData.DOB,
                    SurveyNumber = extractedData.SurveyNumber,
                    Address = extractedData.Address,
                    ECNumber = extractedData.ECNumber,
                    PropertyDetails = extractedData.PropertyDetails,
                    ConfidenceScore = extractedData.ConfidenceScore,
                    ExtractionNotes = extractedData.ExtractionNotes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting EC document: {filePath}");
                throw;
            }
        }

        public async Task<ExtractedDataDto> ExtractAadhaarAsync(string filePath)
        {
            try
            {
                _logger.LogInformation($"Extracting Aadhaar document: {filePath}");
                
                // Call DLL for Aadhaar extraction
                var dll = new DocumentVerificationDLL.DocumentVerificationDLL(_logger as Microsoft.Extensions.Logging.ILogger<DocumentVerificationDLL.DocumentVerificationDLL>);
                var extractedData = await dll.ExtractAadhaarAsync(filePath);
                
                return new ExtractedDataDto
                {
                    Name = extractedData.Name,
                    DOB = extractedData.DOB,
                    AadhaarNumber = extractedData.AadhaarNumber,
                    Address = extractedData.Address,
                    FatherName = extractedData.FatherName,
                    MotherName = extractedData.MotherName,
                    ConfidenceScore = extractedData.ConfidenceScore,
                    ExtractionNotes = extractedData.ExtractionNotes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting Aadhaar document: {filePath}");
                throw;
            }
        }

        public async Task<ExtractedDataDto> ExtractPANAsync(string filePath)
        {
            try
            {
                _logger.LogInformation($"Extracting PAN document: {filePath}");
                
                // Call DLL for PAN extraction
                var dll = new DocumentVerificationDLL.DocumentVerificationDLL(_logger as Microsoft.Extensions.Logging.ILogger<DocumentVerificationDLL.DocumentVerificationDLL>);
                var extractedData = await dll.ExtractPANAsync(filePath);
                
                return new ExtractedDataDto
                {
                    Name = extractedData.Name,
                    DOB = extractedData.DOB,
                    PANNumber = extractedData.PANNumber,
                    FatherName = extractedData.FatherName,
                    ConfidenceScore = extractedData.ConfidenceScore,
                    ExtractionNotes = extractedData.ExtractionNotes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting PAN document: {filePath}");
                throw;
            }
        }

        public async Task<VerificationResultDto> VerifyDocumentsAsync(int uploadedDocumentId)
        {
            try
            {
                // TODO: Implement DLL integration for document verification
                // This would call the DLL function: VerifyDocuments(uploadedEC, originalEC, uploadedAadhaar, originalAadhaar, uploadedPAN, originalPAN)
                
                _logger.LogInformation($"Verifying documents for upload ID: {uploadedDocumentId}");
                
                // Calculate risk score using the risk calculation service
                var riskResult = await _riskCalculationService.CalculateRiskScoreAsync(uploadedDocumentId);
                
                return new VerificationResultDto
                {
                    IsVerified = riskResult.TotalRiskScore <= 70, // Verified if risk score ≤ 70
                    RiskScore = riskResult.TotalRiskScore,
                    VerificationNotes = riskResult.VerificationNotes,
                    FieldMismatches = riskResult.FieldMismatches
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verifying documents for upload ID: {uploadedDocumentId}");
                throw;
            }
        }
    }

    public class VerificationResultDto
    {
        public bool IsVerified { get; set; }
        public decimal RiskScore { get; set; }
        public string? VerificationNotes { get; set; }
        public string? FieldMismatches { get; set; }
    }
}
