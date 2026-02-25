interface LoadingScreenProps {
	error?: string;
}

export default function LoadingScreen({ error }: LoadingScreenProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
			<div className="text-center">
				{error ? (
					<>
						<div className="text-6xl mb-4">❌</div>
						<p className="text-white text-xl">{error}</p>
					</>
				) : (
					<>
						<div className="text-6xl mb-4 animate-pulse">⏳</div>
						<p className="text-white text-xl">Loading...</p>
					</>
				)}
			</div>
		</div>
	);
}
