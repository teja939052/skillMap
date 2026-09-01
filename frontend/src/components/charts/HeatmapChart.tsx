import { type ReactNode } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface HeatmapDataPoint {
  x: number;
  y: number;
  z: number;
  name: string;
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  height?: number;
  children?: ReactNode;
}

function getHeatColor(value: number): string {
  if (value <= 1) return '#fef2f2';
  if (value <= 2) return '#fed7aa';
  if (value <= 3) return '#fde68a';
  if (value <= 4) return '#bbf7d0';
  return '#86efac';
}

export default function HeatmapChart({
  data,
  xLabels,
  yLabels,
  title,
  height = 350,
  children,
}: HeatmapChartProps) {
  const xDomain = [0, xLabels.length - 1];
  const yDomain = [0, yLabels.length - 1];

  return (
    <Card>
      {(title || children) && (
        <CardHeader className="flex flex-row items-center justify-between">
          {title && <CardTitle>{title}</CardTitle>}
          {children}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="x"
              domain={xDomain}
              tickFormatter={(val) => xLabels[val] ?? ''}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={yDomain}
              tickFormatter={(val) => yLabels[val] ?? ''}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval={0}
            />
            <ZAxis type="number" dataKey="z" range={[200, 800]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, _name: string, props: any) => {
                return [`Level: ${value}`, props?.payload?.name ?? ''];
              }}
            />
            <Scatter data={data}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getHeatColor(entry.z)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-red-100" />
            <span className="text-xs text-gray-500">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-amber-200" />
            <span className="text-xs text-gray-500">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-300" />
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
