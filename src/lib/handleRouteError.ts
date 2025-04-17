import { NextResponse } from "next/server";
import { DatabaseError } from "pg";
import { z } from "zod";

// Define the error response structure
interface ErrorResponse {
  error: string;
  details?: any;
}

// Handle errors for API routes
export function handleErrorRoute(error: unknown): NextResponse<ErrorResponse> {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.errors,
      },
      { status: 400 },
    );
  }

  // Drizzle/PostgreSQL errors
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case "23505": // Unique constraint violation
        return NextResponse.json(
          {
            error: "Resource already exists",
            details: error.detail,
          },
          { status: 409 },
        );
      case "23503": // Foreign key violation
        return NextResponse.json(
          {
            error: "Invalid reference to related resource",
            details: error.detail,
          },
          { status: 400 },
        );
      case "23502": // Not null violation
        return NextResponse.json(
          {
            error: "Required field is missing",
            details: error.detail,
          },
          { status: 400 },
        );
      default:
        return NextResponse.json(
          {
            error: "Database error",
            details: error.message,
          },
          { status: 500 },
        );
    }
  }

  // Generic errors
  return NextResponse.json(
    {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 },
  );
}
