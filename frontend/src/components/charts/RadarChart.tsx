import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface RadarChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  nameKey?: string;
  title?: string;
  color?: string;
  height?: number;
}

export default function RadarChart({
  data,
  dataKey,
  nameKey = 'subject',
  title,
  color = '#3b82f6',
  height = 350,
}: RadarChartProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey={nameKey}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 5]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Radar
              name="Proficiency"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
