import { useState, useEffect } from "react";
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
	const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
	const [pendingChanges, setPendingChanges] = useState<{ locked: string[], unlocked: string[] }>({ locked: [], unlocked: [] });

	useEffect(() => {
		setUnlockedIds(new Set(achievements?.filter(a => a.date_unlocked).map(a => a.achievement_id) || []));
	}, [achievements]);

	const toggleAchievement = (id: string) => {
		setUnlockedIds(prev => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const handleSaveClick = () => {
		const locked = achievements?.filter(a => !a.date_unlocked && unlockedIds.has(a.achievement_id)).map(a => a.achievement_id) || [];
		const unlocked = achievements?.filter(a => a.date_unlocked && !unlockedIds.has(a.achievement_id)).map(a => a.achievement_id) || [];
		if (locked.length === 0 && unlocked.length === 0) return;
		setPendingChanges({ locked, unlocked });
	};

	const confirmSave = () => {
		onSave(game, pendingChanges.locked, pendingChanges.unlocked);
		setPendingChanges({ locked: [], unlocked: [] });
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
					<button onClick={handleSaveClick} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
			{pendingChanges.locked.length > 0 || pendingChanges.unlocked.length > 0 ? (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
						<div className="p-6 border-b">
							<h2 className="text-xl font-bold">Confirm Changes</h2>
						</div>
						<div className="p-6 overflow-y-auto flex-1">
							{pendingChanges.locked.length > 0 && (
								<div className="mb-4">
									<h3 className="font-semibold text-green-700 mb-2">Achievements to Unlock ({pendingChanges.locked.length}):</h3>
									<div className="space-y-2">
										{pendingChanges.locked.map(id => {
											const ach = achievements?.find(a => a.achievement_id === id);
											return ach ? (
												<div key={id} className="flex gap-3 items-center bg-green-50 p-3 rounded">
													<img src={ach.image_url_unlocked} alt={ach.name} className="w-12 h-12 rounded" />
													<div>
														<p className="font-medium">{ach.name}</p>
														<p className="text-sm text-gray-600">{ach.description}</p>
													</div>
												</div>
											) : null;
										})}
									</div>
								</div>
							)}
							{pendingChanges.unlocked.length > 0 && (
								<div>
									<h3 className="font-semibold text-red-700 mb-2">Achievements to Lock ({pendingChanges.unlocked.length}):</h3>
									<div className="space-y-2">
										{pendingChanges.unlocked.map(id => {
											const ach = achievements?.find(a => a.achievement_id === id);
											return ach ? (
												<div key={id} className="flex gap-3 items-center bg-red-50 p-3 rounded">
													<img src={ach.image_url_locked} alt={ach.name} className="w-12 h-12 rounded" />
													<div>
														<p className="font-medium">{ach.name}</p>
														<p className="text-sm text-gray-600">{ach.description}</p>
													</div>
												</div>
											) : null;
										})}
									</div>
								</div>
							)}
						</div>
						<div className="p-6 border-t flex gap-3 justify-end">
							<button onClick={() => setPendingChanges({ locked: [], unlocked: [] })} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
								Cancel
							</button>
							<button onClick={confirmSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
								Confirm
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
