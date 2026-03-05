import Electrobun, { Electroview } from "electrobun/view";
import type { GogRPCType } from "../shared/types";

const rcp = Electroview.defineRPC<GogRPCType>({
	maxRequestTime: 5 * 1000,
	handlers: {},
});
const electrobun = new Electrobun.Electroview({ rpc: rcp });

type ElectrobunType = typeof electrobun;

export { electrobun, type ElectrobunType };
