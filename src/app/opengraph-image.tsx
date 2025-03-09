import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Review Insights - Business Review Analytics"
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = "image/png"

export default function Image() {
    return new ImageResponse(
        <div
            style={{
                fontSize: 48,
                background: "linear-gradient(to right, #f7fafc, #edf2f7)",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
                position: "relative",
            }}
        >
            {/* Background pattern */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: "radial-gradient(#2d3748 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                }}
            />

            {/* Logo and title container */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 16,
                        background: "#c1432e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 24,
                        fontSize: 40,
                        color: "white",
                    }}
                >
                    RI
                </div>
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: "bold",
                        background: "linear-gradient(to right, #2d3748, #4a5568)",
                        backgroundClip: "text",
                        color: "transparent",
                    }}
                >
                    Review Insights
                </div>
            </div>

            {/* Tagline */}
            <div
                style={{
                    fontSize: 32,
                    color: "#4a5568",
                    marginBottom: 40,
                }}
            >
                Understand your customer sentiment at a glance
            </div>

            {/* Visual elements */}
            <div
                style={{
                    display: "flex",
                    gap: 24,
                }}
            >
                {[
                    { emoji: "⭐", label: "Ratings" },
                    { emoji: "📊", label: "Analytics" },
                    { emoji: "🔍", label: "Insights" },
                    { emoji: "📱", label: "Multi-location" },
                ].map((item) => (
                    <div
                        key={item.label}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            background: "white",
                            padding: "20px 24px",
                            borderRadius: 12,
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div style={{ fontSize: 40, marginBottom: 8 }}>{item.emoji}</div>
                        <div style={{ fontSize: 20, color: "#4a5568" }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>,
        {
            ...size,
        },
    )
} 