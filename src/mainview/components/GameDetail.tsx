import { useState } from "react";
import type { AchievementRPCType, GameDetailsRPCType } from "../../shared/types";

type GameDetailProps = {
	game: GameDetailsRPCType;
	achievements: AchievementRPCType[] | null;
	onBack: () => void;
	onSave: (game: GameDetailsRPCType, lockedAchievements: string[], unlockedAchievements: string[]) => void;
};

const formatUnlockedDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return dateString;
		}
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
	} catch {
		return dateString;
	}
};

export default function GameDetail({ game, achievements, onBack, onSave }: GameDetailProps) {
	const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => 
		new Set(achievements?.filter(a => a.date_unlocked).map(a => a.achievement_id) || [])
	);

	const toggleAchievement = (id: string) => {
		setUnlockedIds(prev => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<header className="bg-white shadow-sm p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button onClick={onBack} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
							← Back
						</button>
						<h1 className="text-2xl font-bold">{game.title}</h1>
					</div>
					<button onClick={() => {
						const locked = achievements?.filter(a => !a.date_unlocked && unlockedIds.has(a.achievement_id)).map(a => a.achievement_id) || [];
						const unlocked = achievements?.filter(a => a.date_unlocked && !unlockedIds.has(a.achievement_id)).map(a => a.achievement_id) || [];
						onSave(game, locked, unlocked);
					}} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
						Save
					</button>
				</div>
			</header>
			<div className="p-4 space-y-2">
				{achievements === null ? (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-600">Loading achievements...</p>
					</div>
				) : achievements.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-900 text-xl font-bold">No achievements found for this game.</p>
					</div>
				) : (
					achievements.map((achievement) => (
						<div key={achievement.achievement_id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
							<input
								type="checkbox"
								checked={unlockedIds.has(achievement.achievement_id)}
								onChange={() => toggleAchievement(achievement.achievement_id)}
								className="w-5 h-5 cursor-pointer"
							/>
							<img
								src={achievement.date_unlocked ? achievement.image_url_unlocked : achievement.image_url_locked}
								alt={achievement.name}
								className="w-16 h-16 rounded"
							/>
							<div className="flex-1">
								<h3 className="font-semibold">{achievement.name}</h3>
								<p className="text-sm text-gray-600">{achievement.description}</p>
								{achievement.date_unlocked && (
									<p className="text-xs text-green-600 mt-1">Unlocked: {formatUnlockedDate(achievement.date_unlocked)}</p>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
