import StaffPerformance from "../model/StaffPerformance.js";
import User from "../model/User.js";
import Admin from "../model/Admin.js";
import Employee from "../model/Employee.js";

const mapRatingResponse = (performance) => {
  return {
    staffName: performance.staffName,
    ratings: {
      "Punctuality": performance.punctuality,
      "Leave Discipline": performance.leaveDiscipline,
      "Grooming Standards": performance.groomingStandards,
      "Customer Etiquette": performance.customerEtiquette,
      "Teamwork": performance.teamwork,
      "Product Ownership": performance.productOwnership,
      "Customer Issue Ownership": performance.customerIssueOwnership,
      "SOP Adherence": performance.sopAdherence,
      "Adapting": performance.adapting,
      "Learning Attitude": performance.learningAttitude,
    },
    averageScore: performance.averageScore,
    createdAt: performance.createdAt,
  };
};

export const savePerformance = async (req, res) => {
  try {
    const { staffName } = req.body;
    if (!staffName) {
      return res.status(400).json({ success: false, message: "staffName is required" });
    }

    const ratingKeys = [
      "punctuality",
      "leaveDiscipline",
      "groomingStandards",
      "customerEtiquette",
      "teamwork",
      "productOwnership",
      "customerIssueOwnership",
      "sopAdherence",
      "adapting",
      "learningAttitude",
    ];

    for (const key of ratingKeys) {
      const val = req.body[key];
      if (val === undefined || val === null || typeof val !== "number" || val < 1 || val > 5) {
        return res.status(400).json({
          success: false,
          message: `Field ${key} is required and must be an integer between 1 and 5.`,
        });
      }
    }

    // Resolve the employee's ID (empID) from database
    let empID = null;
    const trimmedStaffName = staffName.trim();
    
    // 1. Try User collection
    const user = await User.findOne({ username: { $regex: new RegExp(`^${trimmedStaffName}$`, "i") } });
    if (user) {
      empID = user.empID;
    } else {
      // 2. Try Admin collection
      const admin = await Admin.findOne({ name: { $regex: new RegExp(`^${trimmedStaffName}$`, "i") } });
      if (admin) {
        empID = admin.EmpId;
      } else {
        // 3. Try Employee collection
        const parts = trimmedStaffName.split(/\s+/);
        if (parts.length > 0) {
          const employees = await Employee.find({
            $or: [
              { firstName: { $regex: new RegExp(`^${parts[0]}$`, "i") } },
              { lastName: { $regex: new RegExp(`^${parts[parts.length - 1]}$`, "i") } }
            ]
          });
          const match = employees.find((e) => {
            const fullName = `${e.firstName} ${e.lastName}`.trim().toLowerCase();
            return fullName === trimmedStaffName.toLowerCase();
          });
          if (match) {
            empID = match.employeeId;
          }
        }
      }
    }

    const managerId = req.admin?.userId;
    if (!managerId) {
      return res.status(401).json({ success: false, message: "Unauthorized: manager context missing" });
    }

    const performance = new StaffPerformance({
      staffName: trimmedStaffName,
      empID,
      managerId,
      punctuality: req.body.punctuality,
      leaveDiscipline: req.body.leaveDiscipline,
      groomingStandards: req.body.groomingStandards,
      customerEtiquette: req.body.customerEtiquette,
      teamwork: req.body.teamwork,
      productOwnership: req.body.productOwnership,
      customerIssueOwnership: req.body.customerIssueOwnership,
      sopAdherence: req.body.sopAdherence,
      adapting: req.body.adapting,
      learningAttitude: req.body.learningAttitude,
    });

    await performance.save();

    return res.status(201).json({
      success: true,
      message: "Performance saved successfully!",
    });
  } catch (error) {
    console.error("savePerformance error:", error);
    return res.status(500).json({ success: false, message: "Failed to save performance rating", error: error.message });
  }
};

export const getMyRating = async (req, res) => {
  try {
    const userId = req.admin?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Identify user's details
    let empID = null;
    let staffName = null;

    const user = await User.findById(userId);
    if (user) {
      empID = user.empID;
      staffName = user.username;
    } else {
      const admin = await Admin.findById(userId);
      if (admin) {
        empID = admin.EmpId;
        staffName = admin.name;
      } else {
        const employee = await Employee.findOne({
          $or: [
            { userId },
            { email: req.admin?.email || "" }
          ]
        });
        if (employee) {
          empID = employee.employeeId;
          staffName = `${employee.firstName} ${employee.lastName}`.trim();
        }
      }
    }

    if (!empID && !staffName) {
      return res.status(404).json({ success: false, message: "User has no employee profiles" });
    }

    // Find the latest rating
    const queryConditions = [];
    if (empID) queryConditions.push({ empID });
    if (staffName) queryConditions.push({ staffName: { $regex: new RegExp(`^${staffName}$`, "i") } });

    const performance = await StaffPerformance.findOne({
      $or: queryConditions
    }).sort({ createdAt: -1 });

    if (!performance) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({
      success: true,
      data: mapRatingResponse(performance),
    });
  } catch (error) {
    console.error("getMyRating error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch own performance ratings", error: error.message });
  }
};

export const getStaffResults = async (req, res) => {
  try {
    const managerId = req.admin?.userId;
    if (!managerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { staffName, staffId } = req.query;
    const query = { managerId };

    const searchStr = staffName || staffId;
    if (searchStr) {
      query.$or = [
        { staffName: { $regex: new RegExp(searchStr.trim(), "i") } },
        { empID: searchStr.trim() }
      ];
    }

    const results = await StaffPerformance.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: results.map(mapRatingResponse),
    });
  } catch (error) {
    console.error("getStaffResults error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch staff results", error: error.message });
  }
};
