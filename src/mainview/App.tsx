import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import CardGrid, { type GameCard } from "./components/CardGrid";
import { type GogRPCType } from "../shared/types";
import Electrobun, { Electroview } from "electrobun/view";



function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>();
	const [cards, setCards] = useState<GameCard[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const rpc = Electroview.defineRPC<GogRPCType>({
		handlers: {
		},
	});

	const electrobun = new Electrobun.Electroview({ rpc });

	useEffect(() => {
		electrobun.rpc?.request.getGameList({}).then(({ games, error }) => {
			if (error) {
				setError(error);
				setIsLoading(false);
				return;
			}
			setCards(games.map(gameID => ({
				id: gameID,
				image: "views://mainview/assets/game-placeholder.png",
				title: `Game ${gameID}`,
			})));
			setIsLoading(false);
		});
	}, []);

	const filteredCards = cards.filter((card) =>
		card.title.toLowerCase().includes(searchQuery.toLowerCase()) || card.id.toString().includes(searchQuery)
	);

	const handleCardClick = (card: GameCard) => {
		console.log("Card clicked:", card);
		// TODO: Handle card click
	};

	if (isLoading || error) {
		return <LoadingScreen error={error} />;
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
			<CardGrid cards={filteredCards} onCardClick={handleCardClick} />
		</div>
	);
}

export default App;
