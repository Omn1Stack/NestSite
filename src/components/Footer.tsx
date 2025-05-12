import React from 'react'

const Footer = () => {
  return (
    
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">Nest</h3>
              <p>Your photos, perfectly stored.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-purple-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © {new Date().getFullYear()} Nest. All rights reserved.
          </div>
        </div>
      </footer>
    
  );
}

export default Footer
