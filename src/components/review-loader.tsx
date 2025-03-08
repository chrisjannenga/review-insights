"use client"

import { useEffect, useState } from "react"
import { Star, TrendingUp, MessageSquare, BarChart3 } from "lucide-react"

export function ReviewLoader() {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        { icon: MessageSquare, text: "Collecting reviews..." },
        { icon: Star, text: "Analyzing sentiment..." },
        { icon: BarChart3, text: "Generating insights..." },
        { icon: TrendingUp, text: "Preparing results..." },
    ]

    useEffect(() => {
        const timer = setTimeout(() => {
            if (progress < 100) {
                setProgress((prev) => {
                    const newProgress = prev + 1
                    // Change step based on progress
                    if (newProgress < 25) setCurrentStep(0)
                    else if (newProgress < 50) setCurrentStep(1)
                    else if (newProgress < 75) setCurrentStep(2)
                    else setCurrentStep(3)
                    return newProgress
                })
            }
        }, 50)

        return () => clearTimeout(timer)
    }, [progress])

    const CurrentIcon = steps[currentStep].icon

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center gap-8 max-w-md text-center">
                <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/80 via-primary-foreground/50 to-primary/80 opacity-70 blur-md animate-pulse" />
                    <div className="relative bg-background rounded-full p-6">
                        <div className="relative h-20 w-20 flex items-center justify-center">
                            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                            <svg className="absolute h-full w-full" viewBox="0 0 100 100" aria-label="Loading progress">
                                <circle
                                    className="text-muted stroke-current"
                                    strokeWidth="6"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className="text-primary stroke-current transition-all duration-300 ease-in-out"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="50"
                                    cy="50"
                                    strokeDasharray="264"
                                    strokeDashoffset={264 - (progress * 264) / 100}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <CurrentIcon className="h-10 w-10 text-primary animate-bounce" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">{steps[currentStep].text}</h3>
                    <p className="text-muted-foreground">{progress}% complete</p>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-4 w-full gap-2 mt-4">
                    {steps.map((step, index) => (
                        <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            key={index}
                            className={`flex flex-col items-center p-2 rounded-lg transition-all ${currentStep === index ? "bg-primary/10" : ""
                                }`}
                        >
                            <step.icon
                                className={`h-5 w-5 mb-1 ${currentStep >= index ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <span
                                className={`text-xs text-center ${currentStep >= index ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                Step {index + 1}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

