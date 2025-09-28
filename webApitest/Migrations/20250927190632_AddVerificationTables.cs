using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webApitest.Migrations
{
    /// <inheritdoc />
    public partial class AddVerificationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OriginalAadhaarData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AadhaarName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DOB = table.Column<DateTime>(type: "date", nullable: false),
                    AadhaarNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OriginalAadhaarData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OriginalECData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SurveyNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MeasuringArea = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Village = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Hobli = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Taluk = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    Checked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OriginalECData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OriginalPANData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PANName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PANNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DOB = table.Column<DateTime>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OriginalPANData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VerificationResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UploadId = table.Column<int>(type: "int", nullable: false),
                    AadhaarNameMatch = table.Column<bool>(type: "bit", nullable: true),
                    AadhaarNoMatch = table.Column<bool>(type: "bit", nullable: true),
                    DOBMatch = table.Column<bool>(type: "bit", nullable: true),
                    PANNameMatch = table.Column<bool>(type: "bit", nullable: true),
                    PANNoMatch = table.Column<bool>(type: "bit", nullable: true),
                    ApplicationNumberMatch = table.Column<bool>(type: "bit", nullable: true),
                    ApplicantNameMatch = table.Column<bool>(type: "bit", nullable: true),
                    ApplicantAddressMatch = table.Column<bool>(type: "bit", nullable: true),
                    SurveyNoMatch = table.Column<bool>(type: "bit", nullable: true),
                    MeasuringAreaMatch = table.Column<bool>(type: "bit", nullable: true),
                    VillageMatch = table.Column<bool>(type: "bit", nullable: true),
                    HobliMatch = table.Column<bool>(type: "bit", nullable: true),
                    TalukMatch = table.Column<bool>(type: "bit", nullable: true),
                    DistrictMatch = table.Column<bool>(type: "bit", nullable: true),
                    OverallMatch = table.Column<bool>(type: "bit", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    RiskScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false, defaultValue: 0.00m),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificationResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerificationResults_UserUploadedDocuments_UploadId",
                        column: x => x.UploadId,
                        principalTable: "UserUploadedDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 9, 27, 19, 6, 31, 868, DateTimeKind.Utc).AddTicks(8135), "$2a$11$JjixHB9/DJZvvGMEriZaH..GUB4lnX6DTplhfpaQTvF0KJ98GiALy" });

            migrationBuilder.CreateIndex(
                name: "IX_VerificationResults_UploadId",
                table: "VerificationResults",
                column: "UploadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OriginalAadhaarData");

            migrationBuilder.DropTable(
                name: "OriginalECData");

            migrationBuilder.DropTable(
                name: "OriginalPANData");

            migrationBuilder.DropTable(
                name: "VerificationResults");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 9, 27, 12, 13, 5, 789, DateTimeKind.Utc).AddTicks(5922), "$2a$11$Jy7MDGPuB3TRAijyaBtQcu5JsbWNWhNvDdAQEA2oMhERJpOKWaiya" });
        }
    }
}
