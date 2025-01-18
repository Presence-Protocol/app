'use client'

// Define an array of testimonials
const testimonialsUp = [
  {
    name: "David Gutierrez",
    role: "Creator of @apuchipucha",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
    quote:
      "I couldn't be happier with the service I received. The team went above and beyond to ensure my needs were met.",
  },
  {
    name: "Pierluigi Camomillo", 
    role: "Founder of Camomille",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
    quote:
      "I highly recommend this company. Their attention to detail and commitment to quality is unmatched.",
  },
  {
    name: "Ella Svensson",
    role: "Founder of NoThing",
    image:
      "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
    quote: "Great work Michael!",
  },
];

const testimonialsDown = [
  {
    name: "John Smith",
    role: "CEO of XYZ Corporation",
    image: "https://alfred.lexingtonthemes.com/avatar1.png",
    quote:
      "I'm extremely satisfied with the service provided by the team. They went above and beyond to meet all my requirements.",
  },
  {
    name: "Emily Johnson",
    role: "Co-founder of ABC Company",
    image: "https://alfred.lexingtonthemes.com/avatar3.png",
    quote:
      "I wholeheartedly endorse this company. Their meticulous attention to detail and dedication to excellence are unparalleled.",
  },
  {
    name: "Michael Williams",
    role: "Founder of XYZ Startup",
    image: "https://alfred.lexingtonthemes.com/avatar4.png",
    quote: "Amazing job, team!",
  },
];

export default function TestimonialTwo() {
  return (
    <section>
      <div
        className="mx-auto border-b-2 border-black bg-white 2xl:border-x-2">
        <div className="border-b-2 p-8 lg:px-20 lg:py-32 border-black">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 lg:border-b items-end border-white/10">
            <div>
              <h2
                className="text-3xl lg:text-6xl tracking-tight font-medium text-black">
                We keep making <span className="block">peoples life better</span>
              </h2>
            </div>
            <p className="text-base lg:text-base w-full text-black">
              We are loved by startups, marketing agencies, real estate agencies,
              freelancers, Fortune 500 companies and many more. Our customers'
              testimonials are the best social proof we can get!
            </p>
          </div>
        </div>
        <div className="relative mx-auto px-8 lg:px-20 bg-yellow-500">
          <div
            className="items-center space-x-6 pb-12 lg:pb-0 lg:space-x-8 overflow-y-hidden relative lg:px-4 mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div
              className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8 lg:animate-scrollerUp">
              {testimonialsUp.map((testimonial, index) => (
                <div key={index} className="rounded-3xl shadow-insetp-4 bg-white p-8 lg:p-12 border-2 border-black shadow-large lg:block">
                  <figcaption className="relative flex flex-row gap-4 pb-6 border-b border-white/10">
                    <div className="shrink-0">
                      <img
                        alt="your alt-text"
                        src={testimonial.image}
                        width={56}
                        height={56}
                        decoding="async"
                        data-mining="future"
                        className="object-cover rounded-full h-14 w-14 border-2 border-black shadow-small grayscale shrink-0"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-medium leading-6 text-black">
                        {testimonial.name}
                      </div>
                      <div className="mt-1">
                        <a
                          className="text-sm text-black/70 group-hover:text-black"
                          href="#">
                          {testimonial.role}
                        </a>
                      </div>
                    </div>
                  </figcaption>
                  <figure>
                    <div className="h-full group mt-2 pt-2">
                      <blockquote className="relative">
                        <p className="text-base text-black">{testimonial.quote}</p>
                      </blockquote>
                    </div>
                  </figure>
                </div>
              ))}
            </div>
            <div
              className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8 lg:animate-scrollerDown">
              {testimonialsDown.map((testimonial, index) => (
                <div key={index} className="rounded-3xl shadow-insetp-4 bg-white p-8 lg:p-12 border-2 border-black shadow-large lg:block">
                  <figcaption className="relative flex flex-row gap-4 pb-6 border-b border-white/10">
                    <div className="shrink-0">
                      <img
                        alt="your alt-text"
                        src={testimonial.image}
                        width={56}
                        height={56}
                        decoding="async"
                        data-mining="future"
                        className="object-cover rounded-full h-14 w-14 border-2 border-black shadow-small grayscale shrink-0"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-medium leading-6 text-black">
                        {testimonial.name}
                      </div>
                      <div className="mt-1">
                        <a
                          className="text-sm text-black/70 group-hover:text-black"
                          href="#">
                          {testimonial.role}
                        </a>
                      </div>
                    </div>
                  </figcaption>
                  <figure>
                    <div className="h-full group mt-2 pt-2">
                      <blockquote className="relative">
                        <p className="text-base text-black">{testimonial.quote}</p>
                      </blockquote>
                    </div>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
