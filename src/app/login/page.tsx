import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="relative hidden lg:flex">
                <div className="absolute inset-0 bg-primary" />
                <div className="relative z-20 flex flex-col h-full p-10">
                    <div className="flex items-center text-lg font-medium text-white">
                        <div className="bg-white h-6 w-6 flex items-center justify-center text-primary text-xs font-bold rounded mr-2">
                            RI
                        </div>
                        Review Insights
                    </div>
                    <div className="mt-auto">
                        <blockquote className="space-y-2 text-white">
                            <p className="text-lg">
                                &ldquo;This platform has completely transformed how we handle customer feedback. The insights are invaluable.&rdquo;
                            </p>
                            <footer className="text-sm">Sarah Johnson - Restaurant Owner</footer>
                        </blockquote>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center p-8">
                <div className="mx-auto w-full max-w-[350px] space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email to sign in to your account
                        </p>
                    </div>
                    <LoginForm />
                    <p className="text-center text-sm text-muted-foreground">
                        <a href="/register" className="hover:text-brand underline underline-offset-4">
                            Don&apos;t have an account? Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
} 