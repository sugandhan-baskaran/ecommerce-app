const Footer = () => (
  <footer className="bg-white border-t border-gray-200 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
      <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
      <p>Built with React, Node.js &amp; MongoDB</p>
    </div>
  </footer>
);

export default Footer;
