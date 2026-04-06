import RepoCard from "./RepoCard";

const RepoList = ({ repos }) => {
  return (
    <div>
      {repos.map((repo, index) => (
        <RepoCard key={index} repo={repo} />
      ))}
    </div>
  );
};

export default RepoList;