import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader.jsx";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import authService from "../../services/auth.Service.js";
import { useAuth } from "../../context/authContext.jsx";
import toast from "react-hot-toast";
import { User, Mail, Lock } from "lucide-react";
const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passworldLoading, setPasswordLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassworld, setCurrentPassworld] = useState("");
  const [newPassworl, setNewPassworld] = useState("");
  const [confirmNewPassworld, setConfirmNewPassworld] = useState("");

  return (
    <div>

      <PageHeader title="Profile Setting" />
      <div className="">
        {/** */}
      </div>
    </div>
  );
};

export default ProfilePage;
