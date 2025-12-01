const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const { requireAuth } = require('../middleware/auth');

// Get all locations
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const locations = await locationService.getAllLocations();
        res.json({ locations });
    } catch (error) {
        next(error);
    }
});

// Get location by ID
router.get('/:id', requireAuth, async (req, res, next) => {
    try {
        const location = await locationService.getLocationById(req.params.id);

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json({ location });
    } catch (error) {
        next(error);
    }
});

// Create location
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Location name is required' });
        }

        const result = await locationService.createLocation({
            name,
            description
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({
            ok: true,
            success: true,
            id: result.id
        });
    } catch (error) {
        next(error);
    }
});

// Update location
router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Location name is required' });
        }

        const result = await locationService.updateLocation(req.params.id, {
            name,
            description
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ ok: true, success: true });
    } catch (error) {
        next(error);
    }
});

// Delete location
router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const result = await locationService.deleteLocation(req.params.id);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
