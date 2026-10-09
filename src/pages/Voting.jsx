import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { CATEGORIES, DISTRICTS } from "@/data/constants";
import useSiteSettings from "@/hooks/useSiteSettings";
import { auth, db, googleProvider } from "@/lib/firebase";
import { getDriveImageUrl } from "@/lib/utils";

export default function Voting() {
  return (
    <Layout>
      <VotingContent />
    </Layout>
  );
}

function VotingContent() {
  const settings = useSiteSettings();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const [nominees, setNominees] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [voteTarget, setVoteTarget] = useState(null);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const highlightRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [voterMobile, setVoterMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const q = query(
      collection(db, "nominations"),
      where("status", "in", ["approved", "winner", "not-winner"]),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
      items.sort((a, b) => {
        if (highlightId) {
          if (a.nominationId === highlightId) {
            return -1;
          }
          if (b.nominationId === highlightId) {
            return 1;
          }
        }
        return (b.voteCount || 0) - (a.voteCount || 0);
      });
      setNominees(items);
    });
    return () => unsubscribe();
  }, [highlightId]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 800);
    }
  }, [highlightId, nominees]);
  const copyShareLink = (nominationId) => {
    const url = `${window.location.origin}/voting?highlight=${nominationId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(nominationId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  const filteredNominees = nominees.filter((nominee) => {
    const matchesSearch =
      nominee.name.toLowerCase().includes(search.toLowerCase()) ||
      nominee.nominationId.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || nominee.mainCategory === categoryFilter;
    const matchesDistrict =
      districtFilter === "all" || nominee.district === districtFilter;
    return matchesSearch && matchesCategory && matchesDistrict;
  });
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsLoggedIn(true);
    } catch (err) {
      alert(`Google Login Failed: ${err.message || "Unknown Error"}`);
    }
  };
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (voteTarget && user && voterMobile) {
      setSubmitting(true);
      try {
        const colRef = collection(db, "votes");
        const q = query(
          colRef,
          where("voterUid", "==", user.uid),
          where("nomineeDocId", "==", voteTarget.id),
        );
        if (!(await getDocs(q)).empty) {
          alert("You have already voted for this nominee.");
          setSubmitting(false);
          return;
        }
        const docRef = doc(db, "nominations", voteTarget.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentVotes = docSnap.data().voteCount || 0;
          await addDoc(collection(db, "votes"), {
            nomineeDocId: voteTarget.id,
            nomineeName: voteTarget.name,
            voterName: user.displayName,
            voterMobile: voterMobile,
            voterEmail: user.email,
            voterUid: user.uid,
            voterPhoto: user.photoURL,
            timestamp: serverTimestamp(),
          });
          await updateDoc(docRef, {
            voteCount: currentVotes + 1,
          });
          alert("Vote Submitted Successfully!");
          setShowVoteModal(false);
          setVoterMobile("");
        }
      } catch (err) {
        console.error(err);
        alert("Error submitting vote. Check connection.");
      } finally {
        setSubmitting(false);
      }
    }
  };
  const allDistricts = Array.from(
    new Set(Object.values(DISTRICTS).flat()),
  ).sort();
  return (
    <div className="bg-[#050505] min-h-screen py-10 animate-fade-in">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-gradient-gold">
          Public Voting
        </h2>
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
          Vote for your favourite nominee and help them move forward. You must
          sign in with Google to vote.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input md:w-1/3"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input md:w-1/4 bg-gray-800"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORIES).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="form-input md:w-1/4 bg-gray-800"
          >
            <option value="all">All Districts</option>
            {allDistricts.map((allDistrict) => (
              <option key={allDistrict} value={allDistrict}>
                {allDistrict}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNominees.map((filteredNominee) => {
            const canVote =
              settings.votingOpen !== false &&
              filteredNominee.isVotingOpen !== false;
            const isHighlighted =
              highlightId && filteredNominee.nominationId === highlightId;
            return (
              <div
                key={filteredNominee.id}
                ref={isHighlighted ? highlightRef : null}
                className={`glass p-4 rounded-lg flex flex-col items-center text-center relative transition ${isHighlighted ? "border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "hover:border-amber-500/50"}`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                    ⭐ Featured
                  </div>
                )}
                <div
                  className="w-24 h-24 rounded-full border-4 border-amber-500 overflow-hidden mb-3 shadow-lg cursor-pointer bg-black"
                  onClick={() => setSelectedNominee(filteredNominee)}
                >
                  <img
                    src={getDriveImageUrl(filteredNominee.photo)}
                    className="w-full h-full object-cover"
                    alt={filteredNominee.name}
                    onError={(e) =>
                      (e.currentTarget.src = "https://placehold.co/100")
                    }
                  />
                </div>
                <h3
                  className="font-bold text-white text-lg cursor-pointer hover:text-amber-400"
                  onClick={() => setSelectedNominee(filteredNominee)}
                >
                  {filteredNominee.name}
                </h3>
                <p className="text-xs text-amber-400 mb-1 font-bold">
                  {filteredNominee.mainCategory}
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  {filteredNominee.category}
                </p>
                <p className="text-xs font-mono text-gray-500 mb-4 bg-black px-2 rounded">
                  {filteredNominee.nominationId}
                </p>
                <div className="mt-auto w-full border-t border-gray-700 pt-3">
                  <div className="flex justify-between items-center mb-3 px-4">
                    <span className="text-xs text-gray-400">Total Votes</span>
                    <span className="text-xl font-bold text-white">
                      {filteredNominee.voteCount || 0}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setSelectedNominee(filteredNominee)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                    >
                      View
                    </button>
                    <button
                      disabled={!canVote}
                      onClick={() => {
                        setVoteTarget({
                          id: filteredNominee.id,
                          name: filteredNominee.name,
                        });
                        setShowVoteModal(true);
                      }}
                      className={`flex-1 ${canVote ? "bg-gradient-to-r from-green-600 to-teal-600 hover:scale-105" : "bg-gray-600 cursor-not-allowed"} text-white text-xs font-bold px-4 py-2 rounded-full transition transform`}
                    >
                      {canVote ? "Vote" : "Closed"}
                    </button>
                  </div>
                  <button
                    onClick={() => copyShareLink(filteredNominee.nominationId)}
                    className="w-full flex items-center justify-center gap-1.5 text-[10px] text-gray-500 hover:text-amber-400 py-1 transition"
                  >
                    <i className="fas fa-share-alt text-[10px]" />
                    {copiedId === filteredNominee.nominationId
                      ? "✓ Link Copied!"
                      : "Share Voting Link"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showVoteModal && voteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="glass p-6 rounded-xl max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowVoteModal(false)}
              className="absolute top-2 right-4 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h3 className="text-lg font-bold text-white mb-2">
              Cast Your Vote
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              {"Nominee: "}
              <span className="text-amber-400 font-bold">
                {voteTarget.name}
              </span>
            </p>
            {isLoggedIn ? (
              <form
                onSubmit={handleVoteSubmit}
                className="space-y-4 animate-fade-in"
              >
                <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg mb-4 text-left">
                  <img
                    src={user?.photoURL || "https://placehold.co/40"}
                    className="w-8 h-8 rounded-full"
                    alt="User"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {user?.displayName}
                    </p>
                    <p className="text-[10px] text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="text-left">
                  <label className="text-xs text-gray-400 block mb-1">
                    {"Your Mobile Number "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={voterMobile}
                    onChange={(e) => setVoterMobile(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    className="form-input text-center font-bold tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-3 rounded-lg hover:scale-105 transition"
                >
                  {submitting ? "Submitting..." : "Confirm Vote"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">
                  Sign in with your Google account to cast your vote.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="w-5 h-5"
                    alt="G"
                  />
                  Login with Google
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedNominee && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#151515] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] border border-amber-500/30 my-auto">
            <button
              onClick={() => setSelectedNominee(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition"
            >
              <i className="fas fa-times" />
            </button>
            <div className="h-40 bg-gradient-to-br from-amber-700 via-amber-600 to-[#151515] relative overflow-hidden">
              <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-[#151515] to-transparent" />
            </div>
            <div className="px-8 pb-8 -mt-20 relative text-center">
              <div className="w-40 h-40 mx-auto p-1.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 shadow-2xl relative">
                <img
                  src={getDriveImageUrl(selectedNominee.photo)}
                  className="w-full h-full rounded-full object-cover border-4 border-[#151515] bg-[#151515]"
                  alt={selectedNominee.name}
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-amber-500 text-xs px-2 py-0.5 rounded-full border border-amber-500/50 font-mono shadow-lg">
                  {"ID: "}
                  {selectedNominee.nominationId}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mt-4 tracking-wide font-['Oswald']">
                {selectedNominee.name}
              </h2>
              <p className="text-amber-500 font-bold uppercase text-xs tracking-widest mt-1 mb-6">
                {selectedNominee.mainCategory}
                {" > "}
                {selectedNominee.category}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#1f1f1f] p-3 rounded-2xl border border-gray-800">
                  <div className="text-xs text-gray-500 uppercase font-bold">
                    Location
                  </div>
                  <div className="text-white font-bold truncate">
                    {selectedNominee.district}
                  </div>
                </div>
                <div className="bg-[#1f1f1f] p-3 rounded-2xl border border-gray-800">
                  <div className="text-xs text-gray-500 uppercase font-bold">
                    Experience
                  </div>
                  <div className="text-white font-bold">
                    {selectedNominee.experience || "N/A"}
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a]/50 p-5 rounded-2xl border border-gray-800/50 text-left mb-6">
                <h4 className="text-amber-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                  <i className="fas fa-user-circle" />
                  {" About"}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed italic">
                  {'"'}
                  {selectedNominee.about || "No bio provided."}
                  {'"'}
                </p>
              </div>
              <div className="flex justify-center gap-4 mb-8">
                {selectedNominee.fbProfile && (
                  <a
                    href={selectedNominee.fbProfile}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                )}
                {selectedNominee.fbPage && (
                  <a
                    href={selectedNominee.fbPage}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center hover:bg-blue-400 hover:text-white transition"
                  >
                    <i className="fab fa-facebook-square" />
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-4 rounded-full border border-gray-800 shadow-inner">
                <div className="pl-4 text-left">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">
                    Total Votes
                  </div>
                  <div className="text-xl font-bold text-white">
                    {selectedNominee.voteCount}
                  </div>
                </div>
                {settings.votingOpen !== false &&
                selectedNominee.isVotingOpen !== false ? (
                  <button
                    onClick={() => {
                      setSelectedNominee(null);
                      setVoteTarget({
                        id: selectedNominee.id,
                        name: selectedNominee.name,
                      });
                      setShowVoteModal(true);
                    }}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold px-8 py-2.5 rounded-full transition"
                  >
                    VOTE NOW
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-800 text-gray-500 font-bold px-8 py-2.5 rounded-full cursor-not-allowed border border-gray-700"
                  >
                    VOTING CLOSED
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
