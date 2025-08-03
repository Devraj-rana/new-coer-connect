"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createUserProfile } from "@/lib/profileActions";
import { X, Plus, Building, MapPin, Phone, Mail, Globe, User, Briefcase, GraduationCap } from "lucide-react";
import Image from "next/image";

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
    const { user } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        phone: "",
        bio: "",
        location: "",
        website: "",
        company: "",
        position: "",
        profilePhoto: user?.imageUrl || "/default-avator.png",
        role: "student" as 'student' | 'teacher' | 'admin',
        academicYear: "1st" as '1st' | '2nd' | '3rd' | '4th',
        branch: "BCA" as 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other',
        skills: [] as string[],
        socialLinks: {
            linkedin: "",
            twitter: "",
            github: "",
            instagram: ""
        }
    });

    const [currentSkill, setCurrentSkill] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const socialPlatform = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialPlatform]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addSkill = () => {
        if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, currentSkill.trim()]
            }));
            setCurrentSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createUserProfile(formData);
            toast.success("Profile created successfully!");
            onComplete();
        } catch (error: any) {
            toast.error(error.message || "Failed to create profile");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">C</span>
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Welcome to COER Connect!
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Let's set up your professional profile
                    </CardDescription>
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3].map((stepNum) => (
                            <div
                                key={stepNum}
                                className={`w-3 h-3 rounded-full ${
                                    stepNum <= step 
                                        ? 'bg-blue-500' 
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <User className="w-5 h-5" />
                                    Basic Information
                                </h3>
                                <p className="text-gray-600">Tell us about yourself</p>
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <Image
                                        src={formData.profilePhoto}
                                        alt="Profile"
                                        width={100}
                                        height={100}
                                        className="rounded-full border-4 border-blue-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name *</label>
                                    <Input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                                    <Input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address *
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john.doe@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    I am a *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            formData.role === 'student' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                                    >
                                        <div className="flex items-center gap-3">
                                            <GraduationCap className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <h4 className="font-medium">Student</h4>
                                                <p className="text-sm text-gray-600">Learning and growing</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            formData.role === 'teacher' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-5 h-5 text-green-600" />
                                            <div>
                                                <h4 className="font-medium">Teacher</h4>
                                                <p className="text-sm text-gray-600">Educating and mentoring</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Year and Branch for Students */}
                            {formData.role === 'student' && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            Academic Year *
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {(['1st', '2nd', '3rd', '4th'] as const).map((year) => (
                                                <div 
                                                    key={year}
                                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                                                        formData.academicYear === year 
                                                            ? 'border-blue-500 bg-blue-50' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => setFormData(prev => ({ ...prev, academicYear: year }))}
                                                >
                                                    <div className="font-medium">{year} Year</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Building className="w-4 h-4" />
                                            Branch/Course *
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {(['BCA', 'B.Tech', 'MCA', 'M.Tech', 'BBA', 'MBA', 'BSc', 'MSc', 'Other'] as const).map((branch) => (
                                                <div 
                                                    key={branch}
                                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                                                        formData.branch === branch 
                                                            ? 'border-blue-500 bg-blue-50' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => setFormData(prev => ({ ...prev, branch: branch }))}
                                                >
                                                    <div className="font-medium">{branch}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Bio</label>
                                <Textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Professional Details
                                </h3>
                                <p className="text-gray-600">Your work and location info</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Company
                                    </label>
                                    <Input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        placeholder="COER University"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Position</label>
                                    <Input
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder="Software Developer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Location
                                    </label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Roorkee, India"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Website
                                    </label>
                                    <Input
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Skills
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        value={currentSkill}
                                        onChange={(e) => setCurrentSkill(e.target.value)}
                                        placeholder="Add a skill..."
                                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                    />
                                    <Button onClick={addSkill} size="sm">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                            {skill}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() => removeSkill(skill)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold">Social Links</h3>
                                <p className="text-gray-600">Connect your social profiles (optional)</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                        LinkedIn
                                    </label>
                                    <Input
                                        name="social.linkedin"
                                        value={formData.socialLinks.linkedin}
                                        onChange={handleInputChange}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-black rounded"></div>
                                        GitHub
                                    </label>
                                    <Input
                                        name="social.github"
                                        value={formData.socialLinks.github}
                                        onChange={handleInputChange}
                                        placeholder="https://github.com/yourusername"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-400 rounded"></div>
                                        Twitter
                                    </label>
                                    <Input
                                        name="social.twitter"
                                        value={formData.socialLinks.twitter}
                                        onChange={handleInputChange}
                                        placeholder="https://twitter.com/yourusername"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded"></div>
                                        Instagram
                                    </label>
                                    <Input
                                        name="social.instagram"
                                        value={formData.socialLinks.instagram}
                                        onChange={handleInputChange}
                                        placeholder="https://instagram.com/yourusername"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-6">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={step === 1}
                        >
                            Previous
                        </Button>
                        
                        {step < 3 ? (
                            <Button onClick={nextStep}>
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            >
                                {loading ? "Creating Profile..." : "Complete Setup"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Onboarding;
