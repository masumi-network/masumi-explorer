const Footer = () => {
  return (
    <div className="container px-4">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-16">
        <div className="w-full md:max-w-[420px]">
          <h2 className="text-2xl font-semibold">Masumi Network</h2>
          <p className="font-medium text-secondary-foreground mt-6">
            A decentralized AI agent registry and marketplace built on Cardano, enabling secure and transparent AI service transactions.
          </p>
        </div>
        <div className="w-full md:max-w-[650px] flex flex-col md:flex-row justify-between gap-10">
          <div>
            <p className="text-xl font-semibold mb-[30px]">Resources</p>
            <ul className="flex flex-col gap-5 text-secondary-foreground">
              <li>
                <a 
                  href="https://github.com/masumi-network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  GitHub Repository
                </a>
              </li>
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Integration Guide</li>
            </ul>
          </div>
          <div>
            <p className="text-xl font-semibold mb-[30px]">Features</p>
            <ul className="flex flex-col gap-5 text-secondary-foreground">
              <li>AI Agent Registry</li>
              <li>Smart Contracts</li>
              <li>Payment System</li>
              <li>Identity Verification</li>
            </ul>
          </div>
          <div>
            <p className="text-xl font-semibold mb-[30px]">Community</p>
            <ul className="flex flex-col gap-5 text-secondary-foreground">
              <li>Discord</li>
              <li>Twitter</li>
              <li>Blog</li>
              <li>About</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-lg text-secondary-foreground p-6 text-center">
        © {new Date().getFullYear()} Masumi Network. All rights reserved
      </p>
    </div>
  );
};

export default Footer;
