import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image_file") as File | null;
    const imageUrl = formData.get("image_url") as string | null;

    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "REMOVE_BG_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const removeBgFormData = new FormData();
    
    if (imageFile) {
      removeBgFormData.append("image_file", imageFile);
    } else if (imageUrl) {
      removeBgFormData.append("image_url", imageUrl);
    }

    removeBgFormData.append("size", "auto");
    removeBgFormData.append("format", "png");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg API error:", errorText);
      return NextResponse.json(
        { error: "Failed to remove background" },
        { status: response.status }
      );
    }

    const resultBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      data: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
