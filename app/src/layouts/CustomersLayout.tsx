import BaseLayout from "./BaseLayout";

interface FrontmatterDetails {
  [key: string]: string;
}

interface CustomersLayoutProps {
  frontmatter: {
    customer: string;
    details: FrontmatterDetails;
  };
  children: React.ReactNode;
}

export default function CustomersLayout({ frontmatter, children }: CustomersLayoutProps) {
  return (
    <BaseLayout>
      <section>
        <div
          className="p-8 lg:p-20 lg:py-32 items-center  mx-auto gap-12 h-full bg-yellow-500 border-b-2 2xl:border-x-2 border-black">
          <div className="text-center max-w-4xl mx-auto">
            <img
              className="invert mx-auto"
              src="/brands/1.svg"
              alt="your alt-text"
            />
            <p className="text-5xl mt-12 lg:text-7xl text-black">
              {frontmatter.customer}
            </p>
            <div className="flex flex-wrap justify-center mt-12 gap-8">
              {Object.entries(frontmatter.details).map(([key, value]) => (
                <div key={key}>
                  <p className="text-black font-medium text-lg block">{key}</p>
                  <p className="text-black mt-2 tracking-wide">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="2xl:border-x-2  border-black mx-auto p-8 lg:p-20">
          <div className="max-w-3xl mx-auto">
            <div className="prose-styles">
              {children}
            </div>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
