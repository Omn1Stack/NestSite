

import { FiLoader } from "react-icons/fi";


const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
          <FiLoader className="animate-spin text-purple-500 text-4xl" />
        </div>
);

export default Spinner;
