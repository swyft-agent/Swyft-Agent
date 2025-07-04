import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Sample data - replace with actual database queries
    const units = [
      {
        id: "1",
        title: "Modern 2BR Apartment in Westlands",
        location: "Westlands, Nairobi",
        rent: 85000,
        selling_price: 12000000,
        bedrooms: 2,
        bathrooms: 2,
        size: 120,
        type: "both",
        status: "available",
        images: ["/placeholder.svg?height=200&width=300"],
        description: "Spacious modern apartment with great amenities",
        amenities: ["Parking", "Security", "Gym", "Swimming Pool"],
        available_from: "2024-02-01",
        created_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        title: "Luxury 3BR Penthouse in Kilimani",
        location: "Kilimani, Nairobi",
        rent: 150000,
        bedrooms: 3,
        bathrooms: 3,
        size: 180,
        type: "rent",
        status: "available",
        images: ["/placeholder.svg?height=200&width=300"],
        description: "Luxury penthouse with panoramic city views",
        amenities: ["Parking", "Security", "Gym", "Balcony", "City View"],
        available_from: "2024-02-15",
        created_at: "2024-01-10T14:30:00Z",
      },
      {
        id: "3",
        title: "Cozy 1BR Studio in Karen",
        location: "Karen, Nairobi",
        rent: 45000,
        selling_price: 6500000,
        bedrooms: 1,
        bathrooms: 1,
        size: 65,
        type: "both",
        status: "pending",
        images: ["/placeholder.svg?height=200&width=300"],
        description: "Perfect starter home in quiet neighborhood",
        amenities: ["Parking", "Security", "Garden"],
        available_from: "2024-03-01",
        created_at: "2024-01-20T09:15:00Z",
      },
    ]

    return NextResponse.json(units)
  } catch (error) {
    console.error("Error fetching vacant units:", error)
    return NextResponse.json({ error: "Failed to fetch vacant units" }, { status: 500 })
  }
}
