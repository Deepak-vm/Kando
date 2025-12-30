import { useState } from "react";
import Login from "../components/Auth/login";
import logo from "../assets/react.svg";
import Register from "../components/Auth/register";

function Auth() {
    const [activeTab, setActiveTab] = useState("signin");

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg transition-all duration-500 border border-gray-200">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full shadow-sm p-2 border border-gray-200">
                        <img src={logo} alt="Kando" className="w-16 h-16" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">Kando</h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                    <button
                        onClick={() => setActiveTab("signin")}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${activeTab === "signin"
                                ? "bg-white text-blue-600 shadow-md"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${activeTab === "signup"
                                ? "bg-white text-blue-600 shadow-md"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Create Account
                    </button>
                </div>

                {activeTab === "signin" && <Login />}
                {activeTab === "signup" && <Register />}
            </div>
        </div>
    );
}

export default Auth;