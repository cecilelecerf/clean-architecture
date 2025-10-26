import AuthForm from "../AuthFromWrapper";

export default function RegisterPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="register" />
        </main>
    );
}
