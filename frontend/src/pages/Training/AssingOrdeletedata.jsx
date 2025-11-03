/**
 * Assign or Delete Training Data Component
 * 
 * Displays training details with modules and allows deletion
 * Shows training information, assigned users, and module completion statistics
 * 
 * @returns {JSX.Element} - Assign or delete training data component
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import RoundModule from "../../components/RoundBar/RoundModule";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_TRAINING_DETAILS: (trainingId) => `api/trainings/${trainingId}`,
    DELETE_TRAINING: (trainingId) => `api/user/delete/training/${trainingId}`,
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    TRAINING: '/training',
    TRAINING_DETAILS: (trainingId) => `/Trainingdetails/${trainingId}`,
    REASSIGN: (trainingId) => `/Reassign/${trainingId}`,
};

/**
 * Formats date to localized string
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Formats date to localized date string (without time)
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Assign or Delete Training Data Component
 */
const AssingOrdeletedata = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [training, setTraining] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetches training details from API
     */
    const fetchTrainingDetails = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_TRAINING_DETAILS(id)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setTraining(result);
        } catch (err) {
            console.error('Error fetching training details:', err);
            setError('Failed to load training details');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTrainingDetails();
    }, [fetchTrainingDetails]);

    /**
     * Handles training deletion with confirmation
     */
    const handleDelete = useCallback(async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.DELETE_TRAINING(id)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete training');
            }

            toast.success('Training deleted successfully');
            navigate(ROUTE_PATHS.TRAINING);
        } catch (err) {
            console.error('Error deleting training:', err);
            toast.error('Failed to delete training. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    }, [id, navigate]);

    /**
     * Handles reassign click on mobile devices
     */
    const handleReassign = useCallback(() => {
        toast.warning("Reassign only in computer screen or big screen like tab, laptop...");
    }, []);

    /**
     * Processes module completion data
     */
    const moduleCompletionMap = useMemo(() => {
        if (!training?.data?.averageCompletedModule) return {};

        return training.data.averageCompletedModule.reduce((acc, module) => {
            if (module.moduleId) {
                acc[module.moduleId] = module.completionPercentage || 0;
            }
            return acc;
        }, {});
    }, [training]);

    if (isLoading) {
        return (
            <div className="w-full h-full bg-white">
                <Header name="Assign or Delete training" />
                <SideNav />
                <div className="md:ml-[100px] mt-[100px]">
                    <div className="text-center py-8 text-gray-500">Loading training details...</div>
                </div>
            </div>
        );
    }

    if (error || !training) {
        return (
            <div className="w-full h-full bg-white">
                <Header name="Assign or Delete training" />
                <SideNav />
                <div className="md:ml-[100px] mt-[100px]">
                    <div className="text-center py-8 text-red-500">
                        {error || 'Training not found'}
                    </div>
                    <Link to={ROUTE_PATHS.TRAINING}>
                        <button className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                            Go Back
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const trainingData = training.data || {};
    const modules = trainingData.modules || [];
    const users = training.users || [];

    return (
        <div className="w-full h-full bg-white">
            <Header name="Assign or Delete training" />
            <SideNav />

            <div className="md:ml-[100px] mt-[100px]">
                {/* Back Button */}
                <Link to={ROUTE_PATHS.TRAINING}>
                    <div className="flex items-center gap-1 m-5 text-black cursor-pointer hover:text-[#016E5B] transition-colors">
                        <IoIosArrowBack />
                        <p>Back</p>
                    </div>
                </Link>

                {/* Training Details Card */}
                <div className="md:w-auto w-full md:h-52 border-2 rounded-xl shadow-lg md:mx-20 flex justify-between">
                    <div className="text-black mt-6 ml-6">
                        <h2 className="font-semibold mb-3 text-xl">
                            Training Name: {trainingData.trainingName || 'Untitled Training'}
                        </h2>
                        <div className="flex flex-col gap-1 md:text-md text-sm">
                            <p>No. of Modules: {trainingData.numberOfModules || 0}</p>
                            <p>No. of users: {users.length}</p>
                            <p>Training type: {trainingData.Trainingtype || 'N/A'}</p>
                            <p>Created Date: {formatDate(trainingData.createdDate)}</p>
                            <p>Deadline: {trainingData.deadline ? formatDateOnly(trainingData.deadline) : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-32 mr-5">
                        <div className="flex gap-2 flex-col md:flex-row">
                            <Link to={ROUTE_PATHS.TRAINING_DETAILS(id)}>
                                <button className="border p-2 rounded-md text-black hover:bg-gray-100 transition-colors">
                                    View More Details
                                </button>
                            </Link>
                            <Link className="hidden md:block" to={ROUTE_PATHS.REASSIGN(id)}>
                                <button className="border p-2 text-white rounded-md bg-[#016E5B] hover:bg-[#014f42] transition-colors">
                                    Reassign Training
                                </button>
                            </Link>
                            <button
                                type="button"
                                className="border p-2 block md:hidden text-white rounded-md bg-[#016E5B] hover:bg-[#014f42] transition-colors"
                                onClick={handleReassign}
                            >
                                Reassign Training
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modules Section */}
                <div className="ml-10 mt-10 text-2xl font-semibold text-black flex">
                    <h2>Modules</h2>
                </div>

                <div className="mt-5 md:ml-10 mx-2 flex flex-wrap gap-3">
                    {modules.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500">No modules found</div>
                    ) : (
                        modules.map((module) => {
                            const completionPercentage = moduleCompletionMap[module._id] || 0;
                            const videoCount = module.videos?.length || 0;

                            return (
                                <RoundModule
                                    key={module._id}
                                    title={module.moduleName || 'Untitled Module'}
                                    initialProgress={completionPercentage.toString()}
                                    Module={`No. of videos: ${videoCount}`}
                                    duration={`Created at: ${formatDate(module.createdAt)}`}
                                    complete="Created by HR"
                                />
                            );
                        })
                    )}
                </div>

                {/* Delete Training Section */}
                <div
                    onClick={() => setShowDeleteModal(true)}
                    className="ml-10 mt-10 text-md font-semibold mb-10 text-red-500 flex items-center gap-1 cursor-pointer hover:text-red-700 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setShowDeleteModal(true);
                        }
                    }}
                >
                    <FaTrashAlt />
                    <h2>Delete Training</h2>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <dialog
                        id="deleteTrainingModal"
                        className="modal modal-open"
                        open={showDeleteModal}
                    >
                        <div className="modal-box bg-white text-black">
                            <h3 className="font-bold text-lg">Delete Training!</h3>
                            <p className="py-4">
                                Do you want to delete the training{' '}
                                <span className="text-xl text-red-500 font-semibold">
                                    {trainingData.trainingName || 'this training'}
                                </span>?
                            </p>
                            <div className="modal-action">
                                <form method="dialog" className="flex gap-10">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="btn btn-error text-white disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="btn btn-success text-white"
                                    >
                                        Close
                                    </button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                )}
            </div>
        </div>
    );
};

export default AssingOrdeletedata;
