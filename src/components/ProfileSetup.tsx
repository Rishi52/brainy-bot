import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const educationLevels = [
	{ value: "1st", label: "1st Grade" },
	{ value: "2nd", label: "2nd Grade" },
	{ value: "3rd", label: "3rd Grade" },
	{ value: "4th", label: "4th Grade" },
	{ value: "5th", label: "5th Grade" },
	{ value: "6th", label: "6th Grade" },
	{ value: "7th", label: "7th Grade" },
	{ value: "8th", label: "8th Grade" },
	{ value: "9th", label: "9th Grade" },
	{ value: "10th", label: "10th Grade" },
	{ value: "11th", label: "11th Grade" },
	{ value: "12th", label: "12th Grade" },
	{ value: "college", label: "College" },
];

export default function ProfileSetup({ onComplete }: { onComplete?: () => void }) {
	const [age, setAge] = useState("");
	const [educationLevel, setEducationLevel] = useState("");
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error("Not authenticated");
			}

			const response = await supabase.functions.invoke("user-profile", {
				body: {
					age: parseInt(age),
					education_level: educationLevel,
				},
			});

			if (response.error) throw response.error;

			toast({
				title: "Profile saved!",
				description: "Your profile has been updated successfully.",
			});

			if (onComplete) onComplete();
		} catch (error) {
			console.error("Error saving profile:", error);
			toast({
				title: "Error",
				description: "Failed to save profile. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="age">Age</Label>
					<Input
						id="age"
						type="number"
						min="5"
						max="100"
						value={age}
						onChange={(e) => setAge(e.target.value)}
						required
						placeholder="Enter your age"
					/>
				</div>

				<div>
					<Label htmlFor="education">Education Level</Label>
					<Select value={educationLevel} onValueChange={setEducationLevel} required>
						<SelectTrigger>
							<SelectValue placeholder="Select your education level" />
						</SelectTrigger>
						<SelectContent>
							{educationLevels.map((level) => (
								<SelectItem key={level.value} value={level.value}>
									{level.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? "Saving..." : "Save Profile"}
				</Button>
			</form>
		</div>
	);
}
