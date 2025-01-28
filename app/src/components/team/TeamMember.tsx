interface TeamMemberProps {
  name: string;
  role: string;
  avatar: string;
  url: string;
}

const TeamMember = ({ name, role, avatar, url }: TeamMemberProps) => {
  return (
    <a
      href={url}
      title={name}
      aria-label={name}>
      <div
        className="flex flex-col h-full justify-between divide-black bg-white divide-y-2">
        <div className="block w-full items-center h-full">
          <img
            className="object-cover aspect-[4/4]"
            src={avatar}
            alt={name}
          />
        </div>
        <div
          className="relative p-8 lg:px-20 items-center gap-12 h-full lg:inline-flex bg-green-400">
          <div className="max-w-xl text-center mx-auto">
            <h3 className="text-xl font-semibold text-black">{name}</h3>
            <p className="text-base l text-black mt-4">{role}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

export default TeamMember;
