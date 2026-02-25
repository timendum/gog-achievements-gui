interface HeaderProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
	return (
		<header className="bg-white shadow-md sticky top-0 z-10">
			<div className="container mx-auto px-4 py-4">
				<input
					type="text"
					placeholder="Search..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>
		</header>
	);
}
