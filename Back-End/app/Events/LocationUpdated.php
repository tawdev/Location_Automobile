<?php

namespace App\Events;

use App\Models\Location;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class LocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public Location $location) {}

    // Frontend subscribes to: tracking.{device_id}
    public function broadcastOn(): array
    {
        return [
            new Channel("tracking.{$this->location->device_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'device_id' => $this->location->device_id,
            'lat'       => $this->location->latitude,
            'lng'       => $this->location->longitude,
            'speed'     => $this->location->speed,
            'heading'   => $this->location->heading,
            'address'   => $this->location->address,
            'timestamp' => $this->location->created_at->toISOString(),
        ];
    }
}
