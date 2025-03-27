import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";

const Profile: React.FC = () => {
  // Display user data from auth store
  const { user, setUser } = useAuthStore();
  // Get update method from the user store
  const { updateProfile } = useUserStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep local form data in sync when auth store's user changes
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Call updateProfile from the user store to update backend data
      const updatedUser = await updateProfile(formData);
      // Update auth store with the updated user details to keep global state consistent
      const updatedUserWithRole = { ...updatedUser, role: user?.role || "user" };
      //console.log(updatedUser)
setUser(updatedUserWithRole);
      //setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-purple-600">
          {user?.name && `${user.name}`}! Your Profile
        </h1>
        <div className="mb-6 p-4 border border-purple-600 rounded-lg text-center">
          <p className="text-lg font-semibold text-purple-600">
            {user?.email || "No Email Available"}
          </p>
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                type="text"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Input
                type="text"
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex gap-4">
              <Button
                label={loading ? "Saving..." : "Save"}
                type="submit"
                variant="primary"
                disabled={loading}
              />
              <Button
                label="Cancel"
                onClick={() => setIsEditing(false)}
                variant="secondary"
              />
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-2">
              <span className="font-medium">Name:</span> {user?.name}
            </p>
            <p className="mb-2">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p className="mb-4">
              <span className="font-medium">Phone:</span> {user?.phone}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                label="Edit Profile"
                onClick={() => setIsEditing(true)}
                variant="primary"
              />
              <Button
                label="Change Password"
                onClick={() => navigate("/user/change-password")}
                variant="outline"
              />
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Profile;
