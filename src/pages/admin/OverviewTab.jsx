import { useMemo, useState } from "react";
import { format, isSameDay, subDays } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import {
  Calendar,
  CircleCheckBig,
  CircleX,
  Clock,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { db } from "@/lib/firebase";
import { getCreatedAt } from "@/pages/admin/utils";

export default function OverviewTab({ nominations, votes, stats }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [downloading, setDownloading] = useState(false);
  const dailyCounts = useMemo(() => {
    const items = [];
    for (let h = 13; h >= 0; h--) {
      const b = subDays(new Date(), h);
      const x = nominations.filter((nomination) => {
        const created = getCreatedAt(nomination);
        return created && isSameDay(created, b);
      }).length;
      items.push({
        date: b,
        count: x,
      });
    }
    return items;
  }, [nominations]);
  const maxCount = Math.max(
    ...dailyCounts.map((dailyCount) => dailyCount.count),
    1,
  );
  useMemo(
    () =>
      selectedDate
        ? {
            regs: nominations.filter((nomination) => {
              const created = getCreatedAt(nomination);
              return created && isSameDay(created, selectedDate);
            }),
          }
        : {
            regs: [],
          },
    [selectedDate, nominations],
  );
  const recentNominations = nominations.slice(0, 10);
  const downloadVotesCsv = async () => {
    setDownloading(true);
    try {
      const snapshot = await getDocs(collection(db, "votes"));
      let csv = `Nominee Name,Voter Name,Voter Mobile
`;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        csv += `"${data.nomineeName || ""}","${data.voterName || ""}","${data.voterMobile || ""}"
`;
      });
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "all_votes.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to download votes.");
    } finally {
      setDownloading(false);
    }
  };
  const statCards = [
    {
      label: "Total Nominees",
      val: stats.total,
      Icon: Users,
      color: "from-amber-500 to-yellow-600",
    },
    {
      label: "Pending",
      val: stats.pending,
      Icon: Clock,
      color: "from-yellow-500 to-amber-600",
    },
    {
      label: "Approved",
      val: stats.approved,
      Icon: CircleCheckBig,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Winners",
      val: stats.winner,
      Icon: Trophy,
      color: "from-purple-500 to-pink-600",
    },
    {
      label: "Declined",
      val: stats.declined,
      Icon: CircleX,
      color: "from-red-500 to-rose-600",
    },
    {
      label: "Total Votes",
      val: stats.votes,
      Icon: Vote,
      color: "from-blue-500 to-cyan-600",
    },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Overview</h2>
      <p className="text-sm text-gray-500 mb-6">
        Live statistics across all nominations and votes.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((statCard) => (
          <div
            key={statCard.label}
            className="relative rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#0f0f0f] to-black p-5 overflow-hidden group hover:border-amber-500/40 transition"
          >
            <div
              className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${statCard.color} opacity-10 blur-2xl rounded-full`}
            />
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statCard.color} flex items-center justify-center mb-3 shadow-lg`}
              >
                <statCard.Icon
                  className="text-white"
                  size={18}
                  strokeWidth={2}
                />
              </div>
              <div className="text-3xl font-bold text-white font-['Oswald'] leading-none">
                {statCard.val}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-2 font-bold">
                {statCard.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#0a0a0a] to-black p-6 mb-8">
        <h3 className="text-amber-500 font-bold mb-4 text-sm uppercase tracking-widest">
          Last 14 Days — Registrations
        </h3>
        <div className="flex items-end gap-2 h-48">
          {dailyCounts.map((dailyCount) => (
            <div
              key={dailyCount.date.toISOString()}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div className="text-[9px] text-gray-500 font-mono">
                {dailyCount.count > 0 ? dailyCount.count : ""}
              </div>
              <div className="w-full flex gap-0.5 items-end h-full">
                <div
                  className="flex-1 bg-gradient-to-t from-amber-700 to-amber-400 rounded-t hover:opacity-80 transition"
                  style={{
                    height: `${(dailyCount.count / maxCount) * 100}%`,
                    minHeight: dailyCount.count > 0 ? "4px" : "0",
                  }}
                  title={`${dailyCount.count} registrations`}
                />
              </div>
              <div className="text-[9px] text-gray-500 mt-1 font-mono">
                {format(dailyCount.date, "dd")}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded" />
              {" Registrations"}
            </span>
          </div>
          <button
            onClick={downloadVotesCsv}
            disabled={downloading}
            className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1.5 rounded transition disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download Voter Data (CSV)"}
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#0a0a0a] to-black p-6">
          <h3 className="text-amber-500 font-bold mb-4 text-sm uppercase tracking-widest">
            Pick a Day
          </h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-black/50 border-amber-500/30 text-white hover:bg-amber-500/10"
              >
                <i className="fas fa-calendar mr-2" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-black border-amber-500/30"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid lg:grid-cols-1 gap-6">
        <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#0a0a0a] to-black p-6">
          <h3 className="text-amber-500 font-bold mb-4 text-sm uppercase tracking-widest">
            Latest 10 Registrations
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentNominations.map((recentNomination) => (
              <div
                key={recentNomination.id}
                className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3"
              >
                {recentNomination.photo && (
                  <img
                    src={recentNomination.photo}
                    alt={recentNomination.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {recentNomination.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {recentNomination.mainCategory}
                  </p>
                </div>
                <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                  {getCreatedAt(recentNomination)
                    ? format(getCreatedAt(recentNomination), "dd MMM HH:mm")
                    : ""}
                </span>
              </div>
            ))}
            {recentNominations.length === 0 && (
              <p className="text-gray-500 text-sm">None yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
