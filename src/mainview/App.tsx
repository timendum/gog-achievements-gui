import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import CardGrid, { type GameCard } from "./components/CardGrid";
import GameDetail from "./components/GameDetail";
import { type GogRPCType, type AchievementRPCType } from "../shared/types";
import Electrobun, { Electroview } from "electrobun/view";



function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>();
	const [cards, setCards] = useState<GameCard[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGame, setSelectedGame] = useState<number | null>(null);
	const [achievements, setAchievements] = useState<AchievementRPCType[]>([]);

	const rpc = Electroview.defineRPC<GogRPCType>({
		handlers: {
		},
	});

	const electrobun = new Electrobun.Electroview({ rpc });

	useEffect(() => {
		const fetchGameDetails = async () => {
			if (!electrobun.rpc) {
				setError("RPC not initialized");
				setIsLoading(false);
				return;
			}
			const { games, error } = await electrobun.rpc.request.getGameList({});
			if (error) {
				setError(error);
				setIsLoading(false);
				return;
			}

			const initialCards = games.map(gameID => ({
				id: gameID,
				image: "views://mainview/assets/game-placeholder.png",
				title: `Game ${gameID}`,
				loaded: false
			}));
			setCards(initialCards);
			setIsLoading(false);

			const gamesQueue = [...games];

			const processNext = async () => {
				while (gamesQueue.length > 0) {
					const gameID = gamesQueue.shift()!;
					const details = await electrobun.rpc?.request.getGameDetails({ gameID });

					if (!details) {
						setCards(prev => prev.filter(card => card.id !== gameID));
					} else {
						setCards(prev => prev.map(card =>
							card.id === gameID ? {
								id: gameID,
								image: details.image,
								title: details.title,
								loaded: true
							} : card
						));
					}
				}
			};

			Promise.all(Array(6).fill(null).map(() => processNext()));
		};

		fetchGameDetails();
	}, []);

	const filteredCards = cards.filter((card) =>
		card.title.toLowerCase().includes(searchQuery.toLowerCase()) || card.id.toString().includes(searchQuery)
	);

	const handleCardClick = async (card: GameCard) => {
		const gameId = card.id;
		setSelectedGame(card.id);
		const achievements = await electrobun.rpc?.request.getGameAchievements({ gameID: card.id });
		if (achievements && gameId == selectedGame) {
			setAchievements(achievements);
		}
	};

	if (isLoading || error) {
		return <LoadingScreen error={error} />;
	}

	if (selectedGame) {
		const card = cards.find(c => c.id === selectedGame);
		if (card && card.loaded) {
			return <GameDetail gameTitle={card.title} achievements={achievements} onBack={() => { setAchievements([]); setSelectedGame(null) }} />;
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
