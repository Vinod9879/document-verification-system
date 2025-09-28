using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace webApitest.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDOBColumnSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DOB",
                table: "ExtractedData",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 9, 27, 12, 13, 5, 789, DateTimeKind.Utc).AddTicks(5922), "$2a$11$Jy7MDGPuB3TRAijyaBtQcu5JsbWNWhNvDdAQEA2oMhERJpOKWaiya" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DOB",
                table: "ExtractedData",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 9, 27, 10, 39, 59, 897, DateTimeKind.Utc).AddTicks(1528), "$2a$11$VDo2DvdrBAOkmJyfWKJDY.ovQdGGt253VpfDg4pYaDm/DsgGDxIZW" });
        }
    }
}
