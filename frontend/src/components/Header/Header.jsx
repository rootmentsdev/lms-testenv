import { IoIosSearch } from "react-icons/io";
import { GoBell } from "react-icons/go";
import image from '../../../public/Rootments.jpg'


const Header = ({

    name
}) => {
    return (
        <div className="w-full">


            <div className=" flex  justify-between border[#C8C8C8] bg-white fixed top-0 w-full z-10  border-b pb-6">
                <div className="flex mt-6 lg:justify-evenly items-center ml-5">
                    <div>
                        <img src={image} alt="Logo" className="rounded-full" />
                    </div>
                    <div className="lg:block hidden md:block">
                        <div className="text-2xl text-green-700">
                            ROOTMENTS
                        </div>
                        <div className="flex justify-end text-sm">
                            ENTERPRISE
                        </div>
                    </div>
                    <div className="mt-4 flex items-center ml-10">
                        <a className="text-black text-xl  font-semibold lg:text-2xl">{name ? name : ''}</a>
                    </div>
                </div>

                <div className="flex lg:gap-10 gap-3 items-center mt-4">
                    <div className="form-control relative lg:w-full hidden md:block">
                        <IoIosSearch className="absolute left-3 text-2xl top-1/2 transform -translate-y-1/2 text-black" />
                        <input
                            style={{ borderRadius: '10px' }}

                            type="text"
                            placeholder="Search by name, id, branch or role"
                            className=" border-[#C8C8C8]  border  p-2  bg-white  lg:w-[400px] w-[250px]  pl-10"
                        />
                    </div>
                    <div className="text-2xl text-[#016E5B]">
                        <GoBell />
                    </div>


                    <div className="dropdown dropdown-end mr-9">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>

                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content  rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li>
                                <a className="justify-between">
                                    Profile
                                    <span className="badge">New</span>
                                </a>
                            </li>
                            <li><a>Settings</a></li>
                            <li><a>Logout</a></li>
                        </ul>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default Header