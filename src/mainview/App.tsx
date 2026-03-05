import Electrobun, { Electroview } from "electrobun/view";
import { useEffect, useState } from "react";
import type { AchievementRPCType, GogRPCType } from "../shared/types";
import CardGrid, { type GameCard } from "./components/CardGrid";
import GameDetail from "./components/GameDetail";
import Header from "./components/Header";
import LoadingScreen from "./components/LoadingScreen";

const rcp = Electroview.defineRPC<GogRPCType>({
	maxRequestTime: 5 * 1000,
	handlers: {},
});
const electrobun = new Electrobun.Electroview({ rpc: rcp });

function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>();
	const [cards, setCards] = useState<GameCard[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGame, setSelectedGame] = useState<number | null>(null);
	const [achievements, setAchievements] = useState<AchievementRPCType[] | null>(
		null,
	);

	useEffect(() => {
		const fetchGameDetails = async () => {
			console.debug("init: fetchGameDetails");
			if (!electrobun.rpc) {
				console.error("RPC not initialized");
				setError("RPC not initialized");
				setIsLoading(false);
				return;
			}
			const { games, error } = await electrobun.rpc.request.getGameList({});
			if (error) {
				console.error(error);
				setError(error);
				setIsLoading(false);
				return;
			}

			const initialCards = games.map((gameID) => ({
				id: gameID,
				image: "views://mainview/assets/game-placeholder.png",
				title: `Game ${gameID}`,
				loaded: false,
			}));
			setCards(initialCards);
			setIsLoading(false);

			const gamesQueue = [...games];

			const processNext = async () => {
				while (gamesQueue.length > 0) {
					const gameID = gamesQueue.shift();
					if (gameID === undefined) {
						return;
					}
					let details = null;
					try {
						details = await electrobun.rpc?.request.getGameDetails({ gameID });
					} catch (e) {
						console.error("Error during getGameDetails", gameID, e);
						gamesQueue.push(gameID);
						continue;
					}

					if (!details) {
						setCards((prev) => prev.filter((card) => card.id !== gameID));
					} else {
						setCards((prev) =>
							prev.map((card) =>
								card.id === gameID
									? {
											id: gameID,
											image: details.image,
											title: details.title,
											loaded: true,
										}
									: card,
							),
						);
					}
				}
			};

			Promise.all(
				Array(6)
					.fill(null)
					.map(() => processNext()),
			).catch((e) => {
				console.error(e);
			});
		};

		fetchGameDetails().catch(console.log);
	}, []);

	const filteredCards = cards.filter(
		(card) =>
			card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			card.id.toString().includes(searchQuery),
	);

	const handleCardClick = async (card: GameCard) => {
		const gameId = card.id;
		setSelectedGame(card.id);
		const achievements = await electrobun.rpc?.request.getGameAchievements({
			gameID: card.id,
		});
		console.log("Fetched achievements for game", gameId, achievements);
		if (achievements) {
			setAchievements(achievements);
		}
	};

	const saveHandler: Parameters<typeof GameDetail>[0]["onSave"] = async (
		game,
		lock,
		unlock,
	) => {
		if (!electrobun.rpc) {
			setError("RPC not initialized");
			return;
		}
		console.log(
			"Saving game",
			game,
			"with lock achievements",
			lock,
			"and unlocked achievements",
			unlock,
		);
		if (unlock.length + lock.length === 0) {
			return;
		}
		const promises: Promise<string | null>[] = [];
		for (const achievementID of unlock) {
			promises.push(
				electrobun.rpc.request
					.saveAchievements({ gameID: game.id, unlock: achievementID })
					.then((res) => (res ? null : achievementID)),
			);
		}
		for (const achievementID of lock) {
			promises.push(
				electrobun.rpc.request
					.saveAchievements({ gameID: game.id, lock: achievementID })
					.then((res) => (res ? null : achievementID)),
			);
		}
		try {
			const kos = (await Promise.all(promises)).filter(
				(achievementID) => achievementID != null,
			);
			if (kos.length > 0) {
				console.error("Achievements not saved: ", kos);
			}
		} finally {
			setSelectedGame(null);
			setAchievements([]);
		}
	};

	if (isLoading || error) {
		return <LoadingScreen error={error} />;
	}

	if (selectedGame) {
		const card = cards.find((c) => c.id === selectedGame);
		if (card?.loaded) {
			return (
				<GameDetail
					game={card}
					achievements={achievements}
					onBack={() => {
						setAchievements(null);
						setSelectedGame(null);
					}}
					onSave={saveHandler}
				/>
			);
		} else {
			// force loading
			electrobun.rpc?.request
				.getGameDetails({ gameID: selectedGame })
				.then((details) => {
					if (!details) {
						setCards((prev) => prev.filter((card) => card.id !== selectedGame));
						setSelectedGame(null);
						return;
					}
					setCards((prev) =>
						prev.map((card) =>
							card.id === selectedGame
								? {
										id: selectedGame,
										image: details.image,
										title: details.title,
										loaded: true,
									}
								: card,
						),
					);
				})
				.catch((e) => {
					console.error(e);
				});
		}
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
			<CardGrid cards={filteredCards} onCardClick={handleCardClick} />
		</div>
	);
}

export default App;
