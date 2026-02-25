interface GameCard {
	id: number;
	image: string;
	title: string;
}

interface CardGridProps {
	cards: GameCard[];
	onCardClick: (card: GameCard) => void;
}

export default function CardGrid({ cards, onCardClick }: CardGridProps) {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{cards.map((card) => (
					<div
						key={card.id}
						onClick={() => onCardClick(card)}
						className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
					>
						<img
							src={card.image}
							alt={card.title}
							className="w-full aspect-[16/9] object-cover"
						/>
						<div className="p-3">
							<p className="text-sm font-medium text-gray-800 truncate">
								{card.title}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export type { GameCard };
