using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webApitest.Migrations
{
    /// <inheritdoc />
    public partial class intial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Pincode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserUploadedDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ECPath = table.Column<string>(type: "NVARCHAR(MAX)", nullable: true),
                    AadhaarPath = table.Column<string>(type: "NVARCHAR(MAX)", nullable: true),
                    PANPath = table.Column<string>(type: "NVARCHAR(MAX)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserUploadedDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserUploadedDocuments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExtractedData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UploadId = table.Column<int>(type: "int", nullable: false),
                    AadhaarName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    AadhaarNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DOB = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PANName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PANNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ApplicationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ApplicantName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ApplicantAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SurveyNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MeasuringArea = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Village = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Hobli = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Taluk = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtractedData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExtractedData_UserUploadedDocuments_UploadId",
                        column: x => x.UploadId,
                        principalTable: "UserUploadedDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "City", "CreatedAt", "Email", "FullName", "PasswordHash", "Phone", "Pincode", "Role", "State", "UpdatedAt" },
                values: new object[] { 1, "System", new DateTime(2025, 9, 27, 10, 39, 59, 897, DateTimeKind.Utc).AddTicks(1528), "admin@contactmanager.com", "System Administrator", "$2a$11$VDo2DvdrBAOkmJyfWKJDY.ovQdGGt253VpfDg4pYaDm/DsgGDxIZW", "0000000000", "000000", "Admin", "System", null });

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedData_UploadId",
                table: "ExtractedData",
                column: "UploadId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserUploadedDocuments_UserId",
                table: "UserUploadedDocuments",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExtractedData");

            migrationBuilder.DropTable(
                name: "UserUploadedDocuments");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
