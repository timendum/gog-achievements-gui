import { type AchievementRPCType } from "../../shared/types";

type GameDetailProps = {
	gameTitle: string;
	achievements: AchievementRPCType[] | null;
	onBack: () => void;
};

export default function GameDetail({ gameTitle, achievements, onBack }: GameDetailProps) {
	return (
		<div className="min-h-screen bg-gray-100">
			<header className="bg-white shadow-sm p-4">
				<div className="flex items-center gap-4">
					<button onClick={onBack} className="text-gray-600 hover:text-gray-900">
						← Back
					</button>
					<h1 className="text-2xl font-bold">{gameTitle}</h1>
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
							<img 
								src={achievement.date_unlocked ? achievement.image_url_unlocked : achievement.image_url_locked} 
								alt={achievement.name}
								className="w-16 h-16 rounded"
							/>
							<div className="flex-1">
								<h3 className="font-semibold">{achievement.name}</h3>
								<p className="text-sm text-gray-600">{achievement.description}</p>
								{achievement.date_unlocked && (
									<p className="text-xs text-green-600 mt-1">Unlocked: {achievement.date_unlocked}</p>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
